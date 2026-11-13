// pages/departments.js
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
    }).catch(() => setLoading(false));
  }, []);


  return (
    <PageLayout user={user}>
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '36px', fontWeight: '800', margin: '0 0 10px 0', letterSpacing: '-1px', fontFamily: "'Space Grotesk', sans-serif" }}>Отделы</h1>
        <p style={{ color: '#9ca3af', fontSize: '15px', margin: 0 }}>Информация о специализированных подразделениях Memphis Police Department.</p>
      </div>

      {departments.length > 0 ? (
        <div className="department-grid">
          {departments.map(dept => (
            <DeptCard key={dept.id} dept={dept} isAdminView={false} />
          ))}
        </div>
      ) : (
        <div style={{ 
          background: 'rgba(11, 15, 22, 0.6)', border: '1px solid rgba(148, 163, 184, 0.15)', 
          borderRadius: '4px', padding: '60px 20px', textAlign: 'center', color: '#6b7280', 
          fontFamily: "'DM Mono', monospace", fontSize: '13px' 
        }}>
          [ СПИСОК ОТДЕЛОВ ПУСТ ]
        </div>
      )}
    </PageLayout>
  );
}
