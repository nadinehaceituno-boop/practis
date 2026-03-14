// ══════════════════════════════════════════
// SEDE DATA — Oficinas de atención por operador
// ══════════════════════════════════════════
export const OP_COLORS = {
  claro:    '#DA291C',
  movistar: '#009900',
  entel:    '#00B0CA',
  bitel:    '#CC0000',
};

export const OP_BG = {
  claro:    '#FEE2E2',
  movistar: '#DCFCE7',
  entel:    '#E0F7FA',
  bitel:    '#FEE2E2',
};

export const SAT_COLOR = { low: '#22C55E', mid: '#FBBF24', high: '#EF4444' };
export const SAT_LABEL = { low: 'Baja espera', mid: 'Espera media', high: 'Muy lleno' };
export const SAT_CLASS = { low: 'sat-low', mid: 'sat-mid', high: 'sat-high' };

export const SEDES = [
  // LIMA
  { id:1,  op:'claro',    name:'Claro · Surco',               dept:'lima',     addr:'Av. Caminos del Inca 460, Surco, Lima',      phone:'01 700 0100', lat:-12.1400, lng:-76.9969, sat:'high', wait:'90 min', rating: 4.7, hours:'LunSáb 9:0019:00–18:00 · Sáb 9:00–13:00' },
  { id:2,  op:'claro',    name:'Claro · Miraflores',          dept:'lima',     addr:'Av. Larco 1150, Miraflores, Lima',            phone:'01 700 0100', lat:-12.1219, lng:-77.0282, sat:'low',  wait:'15 min', rating: 3.6, hours:'LunSáb 9:0019:00–19:00 · Sáb 9:00–14:00' },
  { id:3,  op:'claro',    name:'Claro · San Isidro',          dept:'lima',     addr:'Av. Javier Prado Este 890, San Isidro',      phone:'01 700 0100', lat:-12.0972, lng:-77.0348, sat:'mid',  wait:'40 min', rating: 4.5, hours:'LunSáb 9:0019:00–18:30' },
  { id:4,  op:'claro',    name:'Claro · La Victoria',         dept:'lima',     addr:'Av. Aviación 2960, La Victoria, Lima',       phone:'01 700 0100', lat:-12.0698, lng:-77.0175, sat:'high', wait:'75 min', rating: 4.1, hours:'LunSáb 9:0019:00–18:00' },
  { id:5,  op:'movistar', name:'Movistar · San Borja',        dept:'lima',     addr:'Av. San Borja Norte 432, San Borja',         phone:'01 800 3434', lat:-12.1077, lng:-76.9991, sat:'low',  wait:'15 min', rating: 4.8, hours:'LunSáb 9:0019:00–18:30 · Sáb 9:00–13:00' },
  { id:6,  op:'movistar', name:'Movistar · Lince',            dept:'lima',     addr:'Av. Arequipa 2015, Lince, Lima',             phone:'01 800 3434', lat:-12.0862, lng:-77.0286, sat:'high', wait:'75 min', rating: 4.3, hours:'LunSáb 9:0019:00–18:30' },
  { id:7,  op:'movistar', name:'Movistar · Chorrillos',       dept:'lima',     addr:'Av. Defensores del Morro 889, Chorrillos',  phone:'01 800 3434', lat:-12.1686, lng:-77.0193, sat:'low',  wait:'10 min', rating: 4.4, hours:'LunSáb 9:0019:00–18:00' },
  { id:8,  op:'movistar', name:'Movistar · Callao',           dept:'lima',     addr:'Av. Sáenz Peña 890, Callao',                phone:'01 800 3434', lat:-12.0584, lng:-77.1323, sat:'mid',  wait:'45 min', rating: 4.0, hours:'LunSáb 9:0019:00–17:00' },
  { id:9,  op:'entel',    name:'Entel · Centro Lima',         dept:'lima',     addr:'Jr. Lampa 1201, Cercado de Lima',            phone:'01 611 1111', lat:-12.0432, lng:-77.0282, sat:'mid',  wait:'45 min', rating: 4.8, hours:'LunSáb 9:0019:00–18:00' },
  { id:10, op:'entel',    name:'Entel · Los Olivos',          dept:'lima',     addr:'Av. Universitaria 1800, Los Olivos',         phone:'01 611 1111', lat:-11.9893, lng:-77.0686, sat:'low',  wait:'20 min', rating: 4.2, hours:'LunSáb 9:0019:00–19:00 · Sáb 9:00–14:00' },
  { id:11, op:'entel',    name:'Entel · La Molina',           dept:'lima',     addr:'Av. La Molina 399, La Molina',               phone:'01 611 1111', lat:-12.0874, lng:-76.9414, sat:'mid',  wait:'35 min', rating: 4.2, hours:'LunSáb 9:0019:00–18:30' },
  { id:12, op:'bitel',    name:'Bitel · Ate Vitarte',         dept:'lima',     addr:'Av. Nicolás Ayllón 2630, Ate, Lima',         phone:'01 500 0000', lat:-12.0271, lng:-76.9034, sat:'mid',  wait:'50 min', rating: 3.5, hours:'LunSáb 9:0019:00–18:00' },
  { id:13, op:'bitel',    name:'Bitel · San Juan Lurigancho', dept:'lima',     addr:'Av. Gran Chimú 1850, SJL, Lima',             phone:'01 500 0000', lat:-11.9833, lng:-77.0021, sat:'high', wait:'80 min', rating: 3.7, hours:'LunSáb 9:0019:00–17:30' },
  { id:14, op:'bitel',    name:'Bitel · Villa El Salvador',   dept:'lima',     addr:'Av. Separadora Industrial 222, VES',         phone:'01 500 0000', lat:-12.2160, lng:-76.9347, sat:'low',  wait:'20 min', rating: 3.7, hours:'LunSáb 9:0019:00–18:00' },
  // AREQUIPA
  { id:15, op:'claro',    name:'Claro · Arequipa Centro',    dept:'arequipa', addr:'Av. Santa Catalina 213, Arequipa',           phone:'054 234 800', lat:-16.4090, lng:-71.5375, sat:'mid',  wait:'35 min', rating: 3.6, hours:'LunSáb 9:0019:00–18:00' },
  { id:16, op:'movistar', name:'Movistar · Arequipa',        dept:'arequipa', addr:'Mercaderes 419, Arequipa',                   phone:'054 234 900', lat:-16.3988, lng:-71.5372, sat:'low',  wait:'15 min', rating: 3.9, hours:'LunSáb 9:0019:00–18:30' },
  { id:17, op:'entel',    name:'Entel · Arequipa',           dept:'arequipa', addr:'Av. Ejército 900, Cayma, Arequipa',          phone:'054 200 000', lat:-16.3880, lng:-71.5551, sat:'low',  wait:'10 min', rating: 4.0, hours:'LunSáb 9:0019:00–19:00' },
  { id:18, op:'bitel',    name:'Bitel · Arequipa',           dept:'arequipa', addr:'Av. La Marina 320, Arequipa',                phone:'054 500 000', lat:-16.4050, lng:-71.5450, sat:'mid',  wait:'40 min', rating: 4.6, hours:'LunSáb 9:0019:00–17:00' },
  // TRUJILLO
  { id:19, op:'claro',    name:'Claro · Trujillo',           dept:'trujillo', addr:'Jr. Pizarro 620, Trujillo',                  phone:'044 234 100', lat:-8.1120,  lng:-79.0291, sat:'low',  wait:'20 min', rating: 4.2, hours:'LunSáb 9:0019:00–18:00' },
  { id:20, op:'movistar', name:'Movistar · Trujillo',        dept:'trujillo', addr:'Av. España 1680, Trujillo',                  phone:'044 234 200', lat:-8.1050,  lng:-79.0225, sat:'mid',  wait:'40 min', rating: 3.7, hours:'LunSáb 9:0019:00–18:30' },
  { id:21, op:'entel',    name:'Entel · Trujillo',           dept:'trujillo', addr:'Av. Larco 765, Trujillo',                    phone:'044 200 000', lat:-8.1200,  lng:-79.0310, sat:'low',  wait:'15 min', rating: 3.9, hours:'LunSáb 9:0019:00–19:00' },
  { id:22, op:'bitel',    name:'Bitel · Trujillo',           dept:'trujillo', addr:'Av. Mansiche 1850, Trujillo',                phone:'044 500 100', lat:-8.0900,  lng:-79.0450, sat:'high', wait:'65 min', rating: 3.8, hours:'LunSáb 9:0019:00–17:00' },
  // CUSCO
  { id:23, op:'claro',    name:'Claro · Cusco',              dept:'cusco',    addr:'Av. El Sol 612, Cusco',                      phone:'084 234 500', lat:-13.5170, lng:-71.9785, sat:'low',  wait:'10 min', rating: 4.2, hours:'LunSáb 9:0019:00–18:00' },
  { id:24, op:'movistar', name:'Movistar · Cusco',           dept:'cusco',    addr:'Mantas 119, Plaza Regocijo, Cusco',          phone:'084 234 600', lat:-13.5160, lng:-71.9790, sat:'mid',  wait:'30 min', rating: 4.3, hours:'LunSáb 9:0019:00–18:30' },
  { id:25, op:'entel',    name:'Entel · Cusco',              dept:'cusco',    addr:'Av. Collasuyo 600, Cusco',                   phone:'084 200 100', lat:-13.5250, lng:-71.9740, sat:'low',  wait:'15 min', rating: 4.9, hours:'LunSáb 9:0019:00–19:00' },
  // PIURA
  { id:26, op:'claro',    name:'Claro · Piura',              dept:'piura',    addr:'Av. Grau 110, Piura',                        phone:'073 234 700', lat:-5.1943,  lng:-80.6280, sat:'mid',  wait:'35 min', rating: 4.1, hours:'LunSáb 9:0019:00–18:00' },
  { id:27, op:'movistar', name:'Movistar · Piura',           dept:'piura',    addr:'Jr. Ica 470, Piura',                         phone:'073 234 800', lat:-5.1970,  lng:-80.6330, sat:'low',  wait:'15 min', rating: 4.0, hours:'LunSáb 9:0019:00–18:30' },
  { id:28, op:'entel',    name:'Entel · Piura',              dept:'piura',    addr:'Av. Sánchez Cerro 1300, Piura',              phone:'073 200 000', lat:-5.1888,  lng:-80.6315, sat:'low',  wait:'10 min', rating: 3.6, hours:'LunSáb 9:0019:00–19:00' },
  // IQUITOS
  { id:29, op:'claro',    name:'Claro · Iquitos',            dept:'iquitos',  addr:'Jr. Prospero 380, Iquitos',                  phone:'065 234 900', lat:-3.7473,  lng:-73.2513, sat:'low',  wait:'20 min', rating: 3.8, hours:'LunSáb 9:0019:00–17:30' },
  { id:30, op:'movistar', name:'Movistar · Iquitos',         dept:'iquitos',  addr:'Av. La Marina 130, Iquitos',                 phone:'065 235 000', lat:-3.7510,  lng:-73.2480, sat:'mid',  wait:'45 min', rating: 3.9, hours:'LunSáb 9:0019:00–17:30' },
  // CHICLAYO
  { id:31, op:'claro',    name:'Claro · Chiclayo',           dept:'chiclayo', addr:'Av. Balta 398, Chiclayo',                    phone:'074 234 200', lat:-6.7699,  lng:-79.8370, sat:'low',  wait:'15 min', rating: 3.6, hours:'LunSáb 9:0019:00–18:00' },
  { id:32, op:'movistar', name:'Movistar · Chiclayo',        dept:'chiclayo', addr:'Av. Luis Gonzales 680, Chiclayo',            phone:'074 234 300', lat:-6.7740,  lng:-79.8400, sat:'mid',  wait:'30 min', rating: 3.8, hours:'LunSáb 9:0019:00–18:30' },
  { id:33, op:'entel',    name:'Entel · Chiclayo',           dept:'chiclayo', addr:'Av. Pedro Ruiz 950, Chiclayo',               phone:'074 200 000', lat:-6.7660,  lng:-79.8350, sat:'low',  wait:'10 min', rating: 4.9, hours:'LunSáb 9:0019:00–19:00' },
  // HUANCAYO
  { id:34, op:'claro',    name:'Claro · Huancayo',           dept:'huancayo', addr:'Jr. Real 548, Huancayo',                     phone:'064 234 100', lat:-12.0700, lng:-75.2100, sat:'low',  wait:'20 min', rating: 4.5, hours:'LunSáb 9:0019:00–18:00' },
  { id:35, op:'movistar', name:'Movistar · Huancayo',        dept:'huancayo', addr:'Av. Giráldez 252, Huancayo',                 phone:'064 234 200', lat:-12.0735, lng:-75.2075, sat:'mid',  wait:'35 min', rating: 4.7, hours:'LunSáb 9:0019:00–18:00' },
];
