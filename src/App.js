import React, {useState, useEffect} from 'react';
import ReactEcharts from 'echarts-for-react';


function App() {

  const [mini, setMini] = useState([]);
  const [tsi, setTsi] = useState([]);

  function getMini(url) {
    fetch(url, {
        method: 'GET',
        'Content-Type': 'application/json'
      })
      .then(res => res.json())
      .then(res => {
        const data = res.map(v => ({
          name: v['dttm'],
          value: [v['dttm'], v['conc']]
        }));
        setMini(data);
      })
      .catch(console.error);
  };

  function getTsi(url) {
    fetch(url, {
        method: 'GET',
        'Content-Type': 'application/json'
      })
      .then(res => res.json())
      .then(res => {
        const data = res.map(v => ({
          name: v['dttm'],
          value: [v['dttm'], v['conc']]
        }));
        setTsi(data);
      })
      .catch(console.error);
  };

  const getYesterday = () => {
    const dttm = new Date();
    dttm.setHours(dttm.getHours() + 2);
    dttm.setDate(dttm.getDate() - 1);
    return dttm.toISOString().slice(0, -5)
  };

  const getUrlMini = dttm => {
    return `http://atm-dev.site:1337/api/raw_mini?start=${dttm}`
  };
  
  const getUrlTsi = dttm => {
    return `http://atm-dev.site:1337/api/raw_tsi?start=${dttm}`
  };

  useEffect(() => {
    const dttm = getYesterday();
    getMini(getUrlMini(dttm));
    getTsi(getUrlTsi(dttm));
  }, []);

  return ( <
    ReactEcharts 
      option = {{
        title: {
          text: 'SMEAR III CPC comparison'
        },
        tooltip: {
          trigger: 'axis',
          formatter: function (params) {
            params = params[0];
            var date = new Date(params.name);
            return (
              date.getFullYear() + '-' +
              (date.getMonth() + 1) + '-' +
              date.getDate() + ' ' +
              date.getHours() + ':' +
              date.getMinutes() + ':' +
              date.getSeconds() + ', ' +
              params.value[1]
            );
          },
          axisPointer: {
            animation: false
          }
        },
        toolbox: {
          show: true,
          feature: {
            dataZoom: {
              yAxisIndex: 'none'
            },
            saveAsImage: {}
          }
        },
        xAxis: {
          type: 'time',
          splitLine: {
            show: true
          }
        },
        yAxis: {
          type: 'value',
          name: 'cn (cm-3)',
          boundaryGap: [0, '100%'],
          splitLine: {
            show: false
          }
        },
        series: [
          {
            name: 'Fake Data',
            type: 'line',
            showSymbol: false,
            data: mini
          },
          {
            name: 'Fake Data2',
            type: 'line',
            showSymbol: false,
            data: tsi
          },
        ]
      }}
    />
  );
}

export default App;