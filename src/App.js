import React, {
  useState,
  useEffect,
  useRef
} from 'react';
import ReactEcharts from 'echarts-for-react';

// import 'antd/dist/antd.css';
import Row from 'antd/lib/row';
// import Col from 'antd/lib/col';
// import Select from 'antd/lib/select';

// const { Option } = Select;


function App() {

  const [mini, setMini] = useState([]);
  const [tsi, setTsi] = useState([]);
  var backDays = 7
  
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

  function initMini(url) {
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

  function initTsi(url) {
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

  const getPastDays = n => {
    const dttm = new Date();
    dttm.setHours(dttm.getHours() + 2);
    dttm.setDate(dttm.getDate() - n);
    return dttm.toISOString().slice(0, 19)
  };

  const getUrlMini = dttm => {
    return `http://atm-dev.site:1337/api/raw_mini?start=${dttm}`
  };
  
  const getUrlTsi = dttm => {
    return `http://atm-dev.site:1337/api/raw_tsi?start=${dttm}`
  };
  
  const init = () => {
    const dttm = getPastDays(backDays);
    initMini(getUrlMini(dttm));
    initTsi(getUrlTsi(dttm));
  };

  useEffect(() => {
    init();
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
    const dttm = getPastDays(backDays);
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

  const handleChange = () => {
    const v = document.getElementById("select_id").value;
    backDays = (parseInt(v));
    init();
  };

  function pad(num, size) {
    num = num.toString();
    while (num.length < size) num = "0" + num;
    return num;
  }

  return (
    <> 
      <Row style={{margin:20}}>
        <h2>SMEAR III CPC comparison</h2>
      </Row>
      <Row style={{margin:20}}>
        <p>date range</p>
        <select id="select_id" defaultValue="7" onChange={handleChange}>
          <option value="1">1 day</option>
          <option value="2">2 days</option>
          <option value="4">4 days</option>
          <option value="7">7 days</option>
        </select>
      </Row>
      <Row style={{margin:20}}>
        <ReactEcharts 
          option = {{
            title: {
              text: ''
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
    < />
  );
}

export default App;