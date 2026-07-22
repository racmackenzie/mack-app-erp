const MESES = ['jan.', 'fev.', 'mar.', 'abr.', 'mai.', 'jun.', 'jul.', 'ago.', 'set.', 'out.', 'nov.', 'dez.'];

type PartesDataLocal = {
  dia: string;
  mes: string;
  hora: string;
  minuto: string;
};

const extrairPartesDataLocal = (isoString: string): PartesDataLocal | null => {
  if (!isoString) {
    return null;
  }

  const [dataPart, horaPartOriginal] = isoString.split('T');
  if (!dataPart || !horaPartOriginal) {
    return null;
  }

  const dataPartes = dataPart.split('-');
  if (dataPartes.length < 3) {
    return null;
  }

  const [ano, mes, dia] = dataPartes;
  if (!ano || !mes || !dia) {
    return null;
  }

  const horaPart = horaPartOriginal.replace('Z', '').split('+')[0].split('-')[0];
  const [hora, minuto] = horaPart.split(':');

  if (!hora || !minuto) {
    return null;
  }

  return { dia, mes, hora, minuto };
};

export const adicionarSegundosDataHoraLocal = (dataHoraInput: string): string => {
  if (!dataHoraInput) {
    return '';
  }

  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(dataHoraInput)
    ? dataHoraInput
    : `${dataHoraInput}:00`;
};

export const formatarDataLocal = (isoString: string) => {
  if (!isoString) {
    return '';
  }

  const partes = extrairPartesDataLocal(isoString);
  if (!partes) {
    return isoString;
  }

  const nomeMes = MESES[parseInt(partes.mes, 10) - 1] || partes.mes;
  return `${partes.dia} de ${nomeMes}, às ${partes.hora}:${partes.minuto}`;
};

export const formatarPartesDataLocal = (isoString: string) => {
  const partes = extrairPartesDataLocal(isoString);
  if (!partes) {
    return { dia: '--', mes: '--', hora: '--:--' };
  }

  const nomeMes = MESES[parseInt(partes.mes, 10) - 1] || partes.mes;
  return {
    dia: partes.dia,
    mes: nomeMes.replace('.', ''),
    hora: `${partes.hora}:${partes.minuto}`,
  };
};

export const extrairDataLocalISO = (isoString: string): string => {
  if (!isoString) {
    return '';
  }

  const [dataPart] = isoString.split('T');
  return dataPart || '';
};