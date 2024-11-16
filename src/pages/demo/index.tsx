/*
 * Copyright 2024 Stellar Team
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
import React from 'react';
import KQLInput from '@/components/KQLInput';

export default function Demo() {
  return (
    <div
      style={{
        padding: 100,
      }}
    >
      <KQLInput
        datasourceValue={81}
        query={{
          index: 'log_with_message_*',
          date_field: '@timestamp',
        }}
        historicalRecords={[]}
        value=''
      />
    </div>
  );
}
