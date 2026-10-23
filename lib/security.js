// ============================================
// СПИСОК КРАЙМ-ГИЛЬДИЙ И ИХ РОЛЕЙ
// ============================================

export const CRIM_GUILDS = [
  {
    id: '1164353685132951603',
    name: 'Кортез',
    roles: [
      { id: '1087034549835415604', name: 'Роль 1' },
      { id: '1389947183834468402', name: 'Скримзы' },
      { id: '1393333346523938958', name: 'Роль 2' },
      { id: '1389687041066926190', name: 'Кортезы' },
    ]
  },
  {
    id: '1258546253558710333',
    name: 'Корпсес',
    roles: [
      { id: '1258547890020683836', name: 'Роль 1' },
      { id: '1258548800868585522', name: 'Корпсесы' },
    ]
  },
  {
    id: '788056890533740574',
    name: 'АГ',
    roles: [
      { id: '1280960634611306618', name: 'Роль 1' },
      { id: '836647378819088384', name: 'Роль 2' },
      { id: '940506118109683742', name: 'Роль 3' },
      { id: '1548290961426350242', name: 'Роль 4' },
    ]
  },
  {
    id: '561991307480924160',
    name: 'БХ',
    roles: [
      { id: '1262374026400108645', name: 'Аллегри' },
      { id: '1513866991289630750', name: 'Роль 1' },
      { id: '691363966722637874', name: 'Роль 2' },
      { id: '1550484421210021888', name: 'Роль 3' },
      { id: '1558131725354406078', name: 'Роль 4' },
    ]
  },
  {
    id: '1218022995025592330',
    name: 'Гучи',
    roles: [
      { id: '1513866211056681090', name: 'Банхаммеры' },
      { id: '1218150691176972380', name: 'Роль 1' },
      { id: '1433577958546604063', name: 'Роль 2' },
      { id: '1240670015863128135', name: 'Роль 3' },
      { id: '1218150689172357334', name: 'Роль 4' },
      { id: '1218150686856839209', name: 'Гучи' },
    ]
  },
  {
    id: '922630047129567312',
    name: 'Узи',
    roles: [
      { id: '1266087195060600854', name: 'Роль 1' },
      { id: '957772318812295228', name: 'Роль 2' },
      { id: '1419356621389434890', name: 'Роль 3' },
      { id: '1204470144622141450', name: 'Узи' },
    ]
  },
  {
    id: '1282692203839225977',
    name: 'Альянсы',
    roles: [
      { id: '1282692203839225980', name: 'Роль 1' },
      { id: '1522343905809666149', name: 'Альянсы' },
    ]
  },
  {
    id: '1229839837008494702',
    name: 'Сайзы',
    roles: [] 
  },
  {
    id: '1087019411052961842',
    name: 'Скримз',
    roles: [] 
  }
];

// Функция проверки одного пользователя
export async function checkCriminalActivity(accessToken) {
  const alerts = [];

  for (const guild of CRIM_GUILDS) {
    if (guild.roles.length === 0) continue; // Пропускаем сервер, если нет ролей

    try {
      const res = await fetch(
        `https://discord.com/api/users/@me/guilds/${guild.id}/member`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      if (res.status === 404) continue; // Юзера нет в этой гильдии
      if (!res.ok) continue; // Ошибка API

      const member = await res.json();
      const userRoles = member.roles || [];

      const matchedRoles = guild.roles.filter(r => userRoles.includes(r.id));

      if (matchedRoles.length > 0) {
        alerts.push({
          guildName: guild.name,
          guildId: guild.id,
          matchedRoles: matchedRoles.map(r => r.name),
        });
      }
    } catch (e) {
      console.error(`Ошибка проверки гильдии ${guild.id}:`, e.message);
    }
  }

  return alerts;
}
