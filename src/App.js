import React, {
  useState,
  useEffect,
  useRef
} from 'react';
import ReactEcharts from 'echarts-for-react';

import Row from 'antd/lib/row';
// import Col from 'antd/lib/col';


function App() {

  const [mini, setMini] = useState([]);
  const [tsi, setTsi] = useState([]);
  
  function useInterval(callback, delay) {
    const savedCallback = useRef();
    // Remember the latest callback.
    useEffect(() => {
      savedCallback.current = callback;
    });
    // Set up the interval.
    useEffect(() => {
      function tick() {
        savedCallback.current();
      }
      if (delay !== null) {
        let id = setInterval(tick, delay);
        return () => clearInterval(id);
      }
    }, [delay]);
  };

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
        setMini([...mini, ...data]);
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
        setTsi([...tsi, ...data]);
      })
      .catch(console.error);
  };

  const getYesterday = () => {
    const dttm = new Date();
    dttm.setHours(dttm.getHours() + 2);
    dttm.setDate(dttm.getDate() - 1);
    return dttm.toISOString().slice(0, 19)
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

  const appendNew = () => {
    try{
      const lastDttmMini = mini.slice(-1)[0]['name'].slice(0, 19);
      getMini(getUrlMini(lastDttmMini));
    } catch {
      console.log('no mini data');
    };
    try {
      const lastDttmTsi = tsi.slice(-1)[0]['name'].slice(0, 19);
      getTsi(getUrlTsi(lastDttmTsi));
    } catch {
      console.log('no Tsi data');
    };
  };

  const dropOld = () => {
    const dttm = getYesterday();
    let data;
    if (mini.length) {
      data = [...mini];
      while (new Date(dttm) > new Date(data[0]['name'])) {
        data.shift();
      };
      if (data.length !== mini.length) {
        setMini(data);
      };
    }
    if (tsi.length) {
      data = [...tsi];
      while (new Date(dttm) > new Date(data[0]['name'])) {
        data.shift();
      };
      if (data.length !== tsi.length) {
        setTsi(data);
      };
    };
  };

  useInterval(appendNew, 1*60*1000);
  useInterval(dropOld, 10*60*1000);

  function pad(num, size) {
    num = num.toString();
    while (num.length < size) num = "0" + num;
    return num;
  }

  return (
    <Row style={{padding:20}}>
      <ReactEcharts 
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
                pad(date.getMonth() + 1, 2) + '-' +
                pad(date.getDate(), 2) + ' ' +
                pad(date.getHours(), 2) + ':' +
                pad(date.getMinutes(), 2) + ':' +
                pad(date.getSeconds(), 2) + ', ' +
                parseInt(params.value[1])
              );
            },
            axisPointer: {
              animation: false
            }
          },
          legend: {
            data: ['mini_CPC', 'Tsi_CPC']
          },
          grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
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
              show: true
            }
          },
          series: [
            {
              name: 'mini_CPC',
              type: 'line',
              showSymbol: false,
              data: mini
            },
            {
              name: 'Tsi_CPC',
              type: 'line',
              showSymbol: false,
              data: tsi
            },
          ]
        }}
      />
    </Row>
  );
}

export default App;