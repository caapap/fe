import moment from 'moment';
import _ from 'lodash';

export const processFormValues = (values) => {
  const tags = values?.tags?.map((item) => {
    return {
      ...item,
      value: _.trim(Array.isArray(item.value) ? item.value.join(' ') : item.value),
    };
  });
  return {
    ...values,
    btime: moment(values.btime).unix(),
    etime: moment(values.etime).unix(),
    tags,
    periodic_mutes: _.map(values.periodic_mutes, (item) => {
      return {
        enable_days_of_week: _.join(item.enable_days_of_week, ' '),
        enable_stime: moment(item.enable_stime).format('HH:mm'),
        enable_etime: moment(item.enable_etime).format('HH:mm'),
      };
    }),
    cluster: '0',
  };
};
