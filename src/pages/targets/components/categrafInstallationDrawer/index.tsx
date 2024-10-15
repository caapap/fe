import React from 'react';
import { Drawer } from 'antd';
import { useTranslation } from 'react-i18next';
import ModalHOC, { ModalWrapProps } from '@/components/ModalHOC';
import Markdown from '@/components/Markdown';
import categraf_zh_CN from '../../../../../public/docs/categraf/categraf_zh_CN.md';
import categraf_en_US from '../../../../../public/docs/categraf/categraf_en_US.md';

interface Props {
  darkMode: boolean;
}

function index(props: Props & ModalWrapProps) {
  const { darkMode, visible, destroy } = props;
  const { t, i18n } = useTranslation();

  let categrafDoc = categraf_zh_CN;
  if (i18n.language === 'en_US') {
    categrafDoc = categraf_en_US;
  }

  return (
    <Drawer
      width={800}
      title={t('categraf_doc')}
      placement='right'
      onClose={() => {
        destroy();
      }}
      visible={visible}
    >
      <Markdown content={categrafDoc} darkMode={darkMode} />
    </Drawer>
  );
}

export default ModalHOC<Props>(index);
