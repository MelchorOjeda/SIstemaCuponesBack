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

  async updateEncuesta(id: number, dto: any) {
    // Para simplificar el update de preguntas, si se envían preguntas, las reemplazamos todas
    // pero solo si no hay respuestas registradas. Si hay respuestas, solo permitimos editar título/descripción.
    const tieneRespuestas = await this.prisma.encuestaCompletada.count({ where: { id_encuesta: id } });

    if (dto.preguntas && tieneRespuestas > 0) {
      // Si tiene respuestas, solo actualizamos título y descripción
      return await this.prisma.encuesta.update({
        where: { id },
        data: {
          titulo: dto.titulo,
          descripcion: dto.descripcion,
        },
        include: { preguntas: { include: { opciones: true }, orderBy: { orden: 'asc' } } }
      });
    }

    return await this.prisma.$transaction(async (tx) => {
      if (dto.preguntas) {
        // 1. Obtener IDs de preguntas actuales
        const preguntasActuales = await tx.pregunta.findMany({ where: { id_encuesta: id } });
        const idsPreguntas = preguntasActuales.map(p => p.id);

        // 2. Eliminar opciones y preguntas
        await tx.opcionPregunta.deleteMany({ where: { id_pregunta: { in: idsPreguntas } } });
        await tx.pregunta.deleteMany({ where: { id_encuesta: id } });

        // 3. Recrear preguntas
        await tx.encuesta.update({
          where: { id },
          data: {
            titulo: dto.titulo,
            descripcion: dto.descripcion,
            preguntas: {
              create: dto.preguntas.map((p: any) => ({
                texto_pregunta: p.texto_pregunta,
                tipo_pregunta: p.tipo_pregunta,
                orden: p.orden,
                opciones: {
                  create: p.opciones?.map((o: any) => ({
                    texto_opcion: o.texto_opcion,
                  })),
                },
              })),
            },
          }
        });
      } else {
        await tx.encuesta.update({
          where: { id },
          data: {
            titulo: dto.titulo,
            descripcion: dto.descripcion,
          }
        });
      }

      return await tx.encuesta.findUnique({
        where: { id },
        include: { preguntas: { include: { opciones: true }, orderBy: { orden: 'asc' } } }
      });
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
          cupon: {
            include:{
              promocion: true
            }
          }
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

  async findAll() {
    return this.prisma.encuesta.findMany({
      include: {
        preguntas: { include: { opciones: true }, orderBy: { orden: 'asc' } },
        _count: { select: { completadas: true } },
      },
      orderBy: { id: 'desc' },
    });
  }

  async remove(id: number) {
    // Hard-delete: eliminar en orden correcto por FK constraints
    await this.prisma.$transaction(async (tx) => {
      // 1. Obtener IDs de preguntas
      const preguntas = await tx.pregunta.findMany({ where: { id_encuesta: id } });
      const preguntaIds = preguntas.map((p) => p.id);

      // 2. Eliminar respuestas referenciando esas preguntas
      if (preguntaIds.length > 0) {
        await tx.respuestaUsuario.deleteMany({ where: { id_pregunta: { in: preguntaIds } } });
        await tx.opcionPregunta.deleteMany({ where: { id_pregunta: { in: preguntaIds } } });
      }

      // 3. Eliminar preguntas
      await tx.pregunta.deleteMany({ where: { id_encuesta: id } });

      // 4. Desasociar cupones de encuesta completada
      await tx.encuestaCompletada.deleteMany({ where: { id_encuesta: id } });

      // 5. Eliminar la encuesta
      await tx.encuesta.delete({ where: { id } });
    });
    return { message: `Encuesta ${id} eliminada correctamente` };
  }

  // --- NUEVOS MÉTODOS DASHBOARD ---

  async getCompletadas() {
    return this.prisma.encuestaCompletada.findMany({
      include: {
        cliente: true,
        encuesta: true,
        cupon: true,
      },
      orderBy: { fecha_completado: 'desc' },
    });
  }

  async getDetalleCompletada(id: number) {
    const completada = await this.prisma.encuestaCompletada.findUnique({
      where: { id },
      include: {
        cliente: true,
        encuesta: {
          include: {
            preguntas: {
              include: {
                opciones: true,
              },
              orderBy: { orden: 'asc' }
            }
          }
        }
      }
    });

    if (!completada) return null;

    const respuestas = await this.prisma.respuestaUsuario.findMany({
      where: {
        id_cliente: completada.id_cliente,
        id_pregunta: { in: completada.encuesta.preguntas.map(p => p.id) }
      },
      include: { opcion: true }
    });

    const preguntasConRespuesta = completada.encuesta.preguntas.map(p => {
      const resp = respuestas.find(r => r.id_pregunta === p.id);
      return {
        ...p,
        respuesta: resp
      };
    });

    return {
      ...completada,
      preguntas: preguntasConRespuesta
    };
  }

  async removeCompletada(id: number) {
    const completada = await this.prisma.encuestaCompletada.findUnique({
      where: { id },
      include: { encuesta: { include: { preguntas: true } } }
    });

    if (!completada) throw new BadRequestException('Registro no encontrado');

    const preguntaIds = completada.encuesta.preguntas.map(p => p.id);

    await this.prisma.$transaction(async (tx) => {
      await tx.respuestaUsuario.deleteMany({
        where: {
          id_cliente: completada.id_cliente,
          id_pregunta: { in: preguntaIds }
        }
      });
      await tx.encuestaCompletada.delete({ where: { id } });
    });

    return { message: 'Respuesta eliminada correctamente' };
  }

  async getEstadisticas(idEncuesta?: number) {
    if (idEncuesta) {
      const encuesta = await this.prisma.encuesta.findUnique({
        where: { id: idEncuesta },
        include: {
          preguntas: {
            include: {
              opciones: {
                include: { _count: { select: { respuestas: true } } }
              },
              _count: { select: { respuestas: true } }
            },
            orderBy: { orden: 'asc' }
          }
        }
      });

      return encuesta?.preguntas.map(p => {
        if (p.tipo_pregunta === 'MULTIPLE' || p.tipo_pregunta === 'RATING') {
          return {
            id: p.id,
            pregunta: p.texto_pregunta,
            tipo: p.tipo_pregunta,
            data: p.opciones.map(o => ({
              label: o.texto_opcion,
              value: o._count.respuestas
            }))
          };
        } else {
          return {
            id: p.id,
            pregunta: p.texto_pregunta,
            tipo: p.tipo_pregunta,
            total: p._count.respuestas
          };
        }
      });
    } else {
      const encuestas = await this.prisma.encuesta.findMany({
        include: { _count: { select: { completadas: true } } }
      });
      return encuestas.map(e => ({
        id: e.id,
        titulo: e.titulo,
        respuestas: e._count.completadas
      }));
    }
  }

}