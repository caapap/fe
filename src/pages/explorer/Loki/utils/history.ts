import _ from 'lodash';
import moment from 'moment';

const LIMIT = 100;

export const setLokiQueryHistory = (datasourceValue: number, query: string) => {
  if (!query || !datasourceValue) return;
  query = _.trim(query);
  const localKey = `loki-query-history-${datasourceValue}`;
  const queryHistoryStr = localStorage.getItem(localKey);
  let queryHistoryMap = new Map();
  
  if (queryHistoryStr) {
    try {
      const queryHistory = JSON.parse(queryHistoryStr);
      queryHistoryMap = new Map(queryHistory);
    } catch (e) {
      console.error(e);
    }
  }
  
  if (queryHistoryMap.has(query)) {
    // 如果存在的话，就更新时间
    queryHistoryMap.set(query, moment().unix());
  } else {
    // 如果 map 的长度小于等于 LIMIT，直接添加
    if (queryHistoryMap.size <= LIMIT) {
      queryHistoryMap.set(query, moment().unix());
    }
    // 如果 map 的长度大于 LIMIT，找到最小的时间，删除最小的时间
    if (queryHistoryMap.size > LIMIT) {
      let minTime = Infinity;
      let minKey = '';
      for (const [key, value] of queryHistoryMap.entries()) {
        if (value < minTime) {
          minTime = value;
          minKey = key;
        }
      }
      if (minKey) {
        queryHistoryMap.delete(minKey);
        queryHistoryMap.set(query, moment().unix());
      }
    }
  }
  
  const newQueryHistory: [string, number][] = [];
  for (const x of queryHistoryMap.entries()) {
    newQueryHistory.push(x);
  }
  localStorage.setItem(localKey, JSON.stringify(newQueryHistory));
};

export const getLokiQueryHistory = (datasourceValue: number) => {
  if (!datasourceValue) return [];
  const localKey = `loki-query-history-${datasourceValue}`;
  const queryHistoryStr = localStorage.getItem(localKey);
  let queryHistoryMap = new Map();
  
  if (queryHistoryStr) {
    try {
      const queryHistory = JSON.parse(queryHistoryStr);
      queryHistoryMap = new Map(queryHistory);
    } catch (e) {
      console.error(e);
    }
  }
  
  const queryHistory: [string, number][] = [];
  for (const x of queryHistoryMap.entries()) {
    queryHistory.push(x);
  }
  return _.slice(_.reverse(_.sortBy(queryHistory, (item) => item[1])), 0, LIMIT);
}; 