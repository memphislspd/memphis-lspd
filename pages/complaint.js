import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import FormShell from '@/components/FormShell';
import FormLoading from '@/components/FormLoading';

export default function ComplaintForm() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({ fullName: '' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    complainantName: '',
    targetName: '',
    description: '',
    evidence: '',
    incidentDate: ''
  });

  useEffect(() => {
    let cancelled = false;

    fetch('/api/me')
      .then(res => res.json())
      .then(data => {
        if (!data.user) {
          router.replace('/?redirect=/complaint');
          return;
        }
        if (!cancelled) setUser(data.user);
      })
      .catch(() => {
        if (!cancelled) router.replace('/?redirect=/complaint');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    fetch('/api/profile')
      .then(res => res.json())
      .then(data => {
        if (cancelled) return;
        const nextProfile = data?.profile || { fullName: '' };
        setProfile(nextProfile);
        if (nextProfile.fullName) {
          setFormData(prev => ({ ...prev, complainantName: prev.complainantName || nextProfile.fullName }));
        }
      })
      .catch(() => {
        if (!cancelled) {
          setProfile({ fullName: '' });
          window.toast?.error('Не удалось загрузить профиль. Заполните имя вручную.');
        }
      });

    return () => { cancelled = true; };
  }, [router]);

  const isValid = () => Boolean(
    formData.complainantName.trim() &&
    formData.targetName.trim() &&
    formData.description.trim() &&
    formData.evidence.trim() &&
    formData.incidentDate.trim()
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid()) {
      window.toast.error('Заполните все обязательные поля!');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'complaint', ...formData })
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(result.error || 'Не удалось отправить жалобу');

      window.toast.success('Жалоба принята и направлена на рассмотрение.');
      if (result.warning) window.toast.info(result.warning);
      router.push('/applications');
    } catch (error) {
      window.toast.error(error.message || 'Ошибка отправки жалобы');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <FormLoading />;
  if (!user) return null;

  return (
    <FormShell
      user={user}
      title="Жалоба на сотрудника"
      icon="🚨"
      accent="#ef4444"
      subtitle="Сообщите о нарушении или неправомерных действиях сотрудника LSPD."
      backLink="/applications"
    >
      <div className="form-notice form-notice--danger">
        Жалоба должна содержать конкретное описание ситуации и ссылки на подтверждающие материалы.
        Не отправляйте персональные данные, не относящиеся к разбирательству.
      </div>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Ваше имя, фамилия и статик *</label>
          <input type="text" required maxLength={120} value={formData.complainantName}
            onChange={e => setFormData({ ...formData, complainantName: e.target.value })}
            placeholder="Sanya Suspect 270726" />
          {profile.fullName && <p className="form-field-hint">Имя подставлено из профиля — при необходимости его можно изменить.</p>}
        </div>
        <div>
          <label>Имя, фамилия и статик сотрудника *</label>
          <input type="text" required maxLength={120} value={formData.targetName}
            onChange={e => setFormData({ ...formData, targetName: e.target.value })}
            placeholder="Ivan Ivanov 123456" />
        </div>
        <div>
          <label>Дата и время инцидента *</label>
          <input type="text" required maxLength={80} value={formData.incidentDate}
            onChange={e => setFormData({ ...formData, incidentDate: e.target.value })}
            placeholder="20.09.2026, 21:30" />
        </div>
        <div>
          <label>Описание ситуации *</label>
          <textarea required maxLength={1000} value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
            placeholder="Подробно опишите, что произошло..." rows={6} />
        </div>
        <div>
          <label>Доказательства — ссылки на скриншоты или видео *</label>
          <textarea required maxLength={1000} value={formData.evidence}
            onChange={e => setFormData({ ...formData, evidence: e.target.value })}
            placeholder="Вставьте ссылки на материалы..." rows={4} />
          <p className="form-field-hint">
            Поддерживаются imgur, yapx, YouTube, Medal, Streamable, Discord, ibb и prnt.sc.
            Можно указать несколько ссылок через пробел или с новой строки.
          </p>
        </div>
        <button type="submit" disabled={submitting || !isValid()}>
          {submitting ? '⏳ Отправка...' : '🚨 Отправить жалобу'}
        </button>
      </form>
    </FormShell>
  );
}
