import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import PageLayout from '../components/PageLayout';
import DeptCard from '../components/DeptCard';

export default function DepartmentsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/me').then(r => r.json()).then(d => {
      if (!d.user) { router.push('/'); return; }
      setUser(d.user);
    });
    
    fetch('/api/departments').then(r => r.json()).then(d => {
      setDepartments(d);
      setLoading(false);
    });
  }, []);

  if (!user || loading) return null;

  return (
    <PageLayout user={user}>
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '36px', fontWeight: '800', margin: '0 0 10px 0', letterSpacing: '-1px' }}>Отделы</h1>
        <p style={{ color: '#9ca3af', fontSize: '15px', margin: 0 }}>Информация о специализированных подразделениях Memphis Police Department.</p>
      </div>

      {departments.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
          {departments.map(dept => (
            <DeptCard key={dept.id} dept={dept} isAdminView={false} />
          ))}
        </div>
      ) : (
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed #333', padding: '40px', textAlign: 'center', borderRadius: '12px', color: '#8b8ba7' }}>
          Отделы пока не добавлены.
        </div>
      )}
    </PageLayout>
  );
}
