import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ClientesService } from '../clientes/clientes.service';
import { CreateEncuestaRespuestaDto } from './dto/create-encuesta-respuesta.dto';
import { CreateEncuestaDto } from './dto/create-encuesta.dto';
import { CuponesService } from 'src/cupones/cupones.service';

@Injectable()
export class EncuestasService {
  constructor(
    private prisma: PrismaService,
    private clientesService: ClientesService,
    private cuponesService: CuponesService, 
  ) { }
  async crearEncuesta(dto: CreateEncuestaDto) {
    return await this.prisma.encuesta.create({
      data: {
        titulo: dto.titulo,
        descripcion: dto.descripcion,
        preguntas: {
          create: dto.preguntas.map((p) => ({
            texto_pregunta: p.texto_pregunta,
            tipo_pregunta: p.tipo_pregunta,
            orden: p.orden,
            opciones: {
              create: p.opciones?.map((o) => ({
                texto_opcion: o.texto_opcion,
              })),
            },
          })),
        },
      },
      include: { preguntas: { include: { opciones: true } } },
    });
  }

  async guardarRespuestas(dto: CreateEncuestaRespuestaDto) {
    return await this.prisma.$transaction(async (tx) => {
      const cliente = await this.clientesService.upsertCliente({
        correo: dto.correo,
        nombre: dto.nombre,
      }, tx);

      const yaCompleto = await tx.encuestaCompletada.findFirst({
        where: { id_encuesta: dto.id_encuesta, id_cliente: cliente.id }
      });

      if (yaCompleto) {
        throw new BadRequestException('Ya has participado en esta encuesta anteriormente.');
      }

      for (const resp of dto.respuestas) {
        await tx.respuestaUsuario.create({
          data: {
            id_pregunta: resp.id_pregunta,
            id_cliente: cliente.id,
            id_opcion: resp.id_opcion,
            respuesta_texto: resp.respuesta_texto,
          },
        });
      }

      const idPromocion10 = 10;
      const nuevoCupon = await this.cuponesService.generarCuponEspecial(
        cliente.id,
        idPromocion10,
        tx
      );

      return await tx.encuestaCompletada.create({
        data: {
          id_encuesta: dto.id_encuesta,
          id_cliente: cliente.id,
          id_cupon: nuevoCupon.id, 
        },
        include: {
          cupon: true
        }
      });
    });
  }

  async getEncuestaActiva(id: number) {
    return this.prisma.encuesta.findUnique({
      where: { id },
      include: {
        preguntas: {
          include: { opciones: true },
          orderBy: { orden: 'asc' },
        },
      },
    });
  }
}