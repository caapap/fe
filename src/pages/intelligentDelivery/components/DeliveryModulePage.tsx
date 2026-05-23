import React from 'react';
import { Button, Space, Tag } from 'antd';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import PageLayout from '@/components/pageLayout';
import SmartDeliveryIcon from '@/components/SideMenu/icons/SmartDeliveryIcon';

import { NS, PATHS } from '../constants';

type ModuleKey = keyof typeof PATHS;

interface Props {
  moduleKey: ModuleKey;
}

const accentClassMap: Record<ModuleKey, string> = {
  pipelines: 'from-[#5B8FF9] via-[#6A5AF9] to-[#8B5CF6]',
  artifacts: 'from-[#14B8A6] via-[#0EA5A4] to-[#22C55E]',
  serviceConnections: 'from-[#0EA5E9] via-[#06B6D4] to-[#10B981]',
  knowledge: 'from-[#F59E0B] via-[#FB923C] to-[#F97316]',
  tests: 'from-[#EC4899] via-[#F43F5E] to-[#EF4444]',
};

const siblingOrder: ModuleKey[] = ['pipelines', 'artifacts', 'serviceConnections', 'knowledge', 'tests'];

function InfoCard(props: { label: string; value: string }) {
  const { label, value } = props;
  return (
    <div className='rounded-2xl border border-fc-200 bg-[rgba(255,255,255,0.72)] p-4 shadow-[0_8px_24px_rgba(15,23,42,0.06)] backdrop-blur-sm dark:bg-[rgba(17,24,39,0.45)]'>
      <div className='text-xs font-medium uppercase tracking-[0.12em] text-secondary'>{label}</div>
      <div className='mt-2 text-sm leading-6 text-title'>{value}</div>
    </div>
  );
}

export default function DeliveryModulePage({ moduleKey }: Props) {
  const { t } = useTranslation(NS);
  const title = t(`modules.${moduleKey}.title`);
  const eyebrow = t(`modules.${moduleKey}.eyebrow`);
  const desc = t(`modules.${moduleKey}.desc`);
  const accent = accentClassMap[moduleKey];

  return (
    <PageLayout
      title={
        <Space size={10}>
          <span>{title}</span>
          <Tag color='processing'>{t('status')}</Tag>
        </Space>
      }
      icon={<SmartDeliveryIcon />}
    >
      <div className='fc-page n9e'>
        <div className='overflow-hidden rounded-[28px] border border-fc-200 bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(247,248,252,0.92))] shadow-[0_18px_60px_rgba(15,23,42,0.08)] dark:bg-[linear-gradient(135deg,rgba(17,24,39,0.92),rgba(15,23,42,0.88))]'>
          <div className='relative px-7 py-8 md:px-9 md:py-10'>
            <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${accent}`} />
            <div className='absolute -right-14 top-8 h-36 w-36 rounded-full bg-[radial-gradient(circle,rgba(91,143,249,0.18),transparent_68%)] blur-xl' />
            <div className='relative z-10 grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_340px]'>
              <div>
                <div className='text-xs font-semibold uppercase tracking-[0.18em] text-secondary'>{eyebrow}</div>
                <div className='mt-3 text-[28px] font-semibold leading-tight text-title md:text-[34px]'>{title}</div>
                <div className='mt-4 max-w-3xl text-sm leading-7 text-secondary md:text-[15px]'>{desc}</div>
                <div className='mt-6 flex flex-wrap gap-3'>
                  {siblingOrder
                    .filter((key) => key !== moduleKey)
                    .map((key) => (
                      <Link key={key} to={PATHS[key]}>
                        <Button size='small'>{t(`modules.${key}.title`)}</Button>
                      </Link>
                    ))}
                </div>
              </div>
              <div className={`rounded-[24px] bg-gradient-to-br ${accent} p-[1px]`}>
                <div className='h-full rounded-[23px] bg-[rgba(255,255,255,0.92)] p-5 dark:bg-[rgba(15,23,42,0.92)]'>
                  <div className='flex items-center gap-3'>
                    <div className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${accent} text-white shadow-lg`}>
                      <SmartDeliveryIcon />
                    </div>
                    <div>
                      <div className='text-sm font-semibold text-title'>{t('title')}</div>
                      <div className='text-xs text-secondary'>{t(`sections.${moduleKey}.desc`)}</div>
                    </div>
                  </div>
                  <div className='mt-5 grid gap-3'>
                    <InfoCard label={t('cards.blueprint')} value={t(`values.${moduleKey}_blueprint`)} />
                    <InfoCard label={t('cards.object')} value={t(`values.${moduleKey}_object`)} />
                    <InfoCard label={t('cards.rhythm')} value={t(`values.${moduleKey}_rhythm`)} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
