import React, {useState, useEffect} from 'react';
import ReactEcharts from 'echarts-for-react';


function App() {

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

  const [mini, setMini] = useState([]);
  const [tsi, setTsi] = useState([]);
  let url;
  let updateDttm;
  useEffect(() => {
    const dttm = '2021-10-29T08:20:00'
    url = 'http://atm-dev.site:1337/api/raw_mini?start=2021-10-29T08:20:00';
    getMini(url);
    url = 'http://atm-dev.site:1337/api/raw_tsi?start=2021-10-29T08:20:00';
    getTsi(url);
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