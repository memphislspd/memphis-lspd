// pages/departments.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Header from '../components/Header';
import DeptCard from '../components/DeptCard';

// Тут ты можешь вписать реальные данные отделов и их хайрангов
const DEPARTMENTS_DATA = [
  {
    name: 'SWAT', icon: '🛡️', description: 'Спецназ. Реагирование на особо опасные ситуации, штурмы, освобождение заложников.',
    highRanks: [
      { name: 'Sanya Suspect', rank: 'Командир SWAT' },
      { name: 'Ivan Petrov', rank: 'Заместитель командира' }
    ]
  },
  {
    name: 'DB', icon: '🕵️', description: 'Детективное бюро. Сбор информации, скрытая работа, расследования.',
    highRanks: [
      { name: 'Oleg Detective', rank: 'Глава DB' }
    ]
  },
  {
    name: 'IAD', icon: '⚖️', description: 'Отдел внутренних расследований. Контроль за соблюдением законов сотрудниками.',
    highRanks: [
      { name: 'John Smith', rank: 'Глава IAD' }
    ]
  }
];

export default function DepartmentsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch('/api/me').then(r => r.json()).then(d => {
      if (!d.user) { router.push('/'); return; }
      setUser(d.user);
    });
  }, []);

  if (!user) return null;

  return (
    <div style={{ minHeight: '100vh', background: '#030303', color: 'white', fontFamily: "'Montserrat', sans-serif" }}>
      <Header user={user} />
      
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '80px 20px' }}>
        <h1 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '10px' }}>Отделы</h1>
        <p style={{ color: '#9ca3af', marginBottom: '40px' }}>Информация о специализированных подразделениях Memphis Police Department.</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
          {DEPARTMENTS_DATA.map(dept => (
            <DeptCard key={dept.name} {...dept} />
          ))}
        </div>
      </div>
    </div>
  );
}
