/**
 * Test unitario de la descarga de documentos (DownloadDocumentUseCase).
 * Verifica el aislamiento: solo el administrador, el abogado asignado y el
 * cliente dueño del expediente pueden descargar el contenido.
 */
const { DownloadDocumentUseCase } = require('../src/modules/documents/application/use-cases/download-document.use-case');
const { NotFoundError, ForbiddenError } = require('../src/shared/errors/app-error');

describe('DownloadDocumentUseCase (permisos de descarga)', () => {
  const file = { nombre: 'demanda.pdf', tipo: 'PDF', mimeType: 'application/pdf', expedienteId: 'c-1', contenido: Buffer.from('hola') };
  const legalCase = { id: 'c-1', clienteId: 'cli-1', abogadoId: 'abg-1' };

  const buildSut = (found = file, foundCase = legalCase) => {
    const repo = { findContent: jest.fn().mockResolvedValue(found) };
    const cases = { findById: jest.fn().mockResolvedValue(foundCase) };
    return new DownloadDocumentUseCase(repo, cases);
  };

  it('el abogado asignado descarga el documento', async () => {
    const out = await buildSut().execute('d-1', { sub: 'abg-1', rol: 'abogado' });
    expect(out.nombre).toBe('demanda.pdf');
    expect(out.contenido).toBeInstanceOf(Buffer);
  });

  it('el cliente dueño descarga el documento', async () => {
    const out = await buildSut().execute('d-1', { sub: 'cli-1', rol: 'cliente' });
    expect(out.mimeType).toBe('application/pdf');
  });

  it('el administrador descarga cualquier documento', async () => {
    const out = await buildSut().execute('d-1', { sub: 'admin', rol: 'administrador' });
    expect(out.nombre).toBe('demanda.pdf');
  });

  it('otro abogado NO puede descargar (403)', async () => {
    await expect(buildSut().execute('d-1', { sub: 'abg-2', rol: 'abogado' }))
      .rejects.toBeInstanceOf(ForbiddenError);
  });

  it('documento inexistente o sin contenido → 404', async () => {
    await expect(buildSut(null).execute('d-x', { sub: 'admin', rol: 'administrador' }))
      .rejects.toBeInstanceOf(NotFoundError);
  });
});
