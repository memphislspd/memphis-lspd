// pages/staff.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import StaffCard from '../components/StaffCard';

export default function StaffPage() {
  const router = useRouter();
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/staff')
      .then(res => res.json())
      .then(data => {
        setStaff(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <div style={{ minHeight: '100vh', background: '#0a0a0a' }} />;

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0a', // Темный фон в стиле FIB
      backgroundImage: 'radial-gradient(circle at 50% 0%, #1a1a3e 0%, transparent 50%)', // Легкий синий отблик сверху
      color: 'white',
      padding: '80px 20px'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
        
        <button onClick={() => router.push('/dashboard')} style={{ marginBottom: '40px', background: 'transparent', color: '#8b8ba7', border: 'none', cursor: 'pointer', fontSize: '14px' }}>← Вернуться на главную</button>

        {/* Заголовок как на референсе */}
        <div style={{ display: 'inline-block', background: '#ff2640', color: 'white', fontSize: '12px', fontWeight: 'bold', padding: '6px 16px', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '20px' }}>
          TOP SECRET // CLEARANCE REQUIRED
        </div>
        
        <h1 style={{ fontSize: '48px', fontWeight: '900', margin: '0 0 10px 0', letterSpacing: '1px' }}>Руководство</h1>
        <p style={{ color: '#8b8ba7', fontSize: '16px', marginBottom: '60px' }}>Высшее командование Memphis Police Department</p>

        {/* Сетка карточек */}
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {staff.length > 0 ? (
            staff.map(member => (
              <StaffCard key={member.id} member={member} isAdminView={false} />
            ))
          ) : (
            <div style={{ color: '#8b8ba7', padding: '40px', background: '#121212', borderRadius: '16px', border: '1px dashed #333' }}>
              Состав пока пуст. Добавь людей через админку.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
