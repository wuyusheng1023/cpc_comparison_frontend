import ReactEcharts from 'echarts-for-react';


function App() {

  function get(url, processor = f => f, errorHandler = console.error) {
    const d = new Date();
    fetch(url, {
      method: 'GET',
      'Content-Type': 'application/json'
    })
      .then(res => res.json())
      .then(processor)
      .then((res) => console.log(d.toISOString(), 'Get data from API:', res))
      .catch(errorHandler);
  };

  const process_raw_data = data => {
    console.log(data)
  }

  const url = 'http://atm-dev.site:1337/api/raw_mini?start=2021-10-29T18:00:00';
  get(url, process_raw_data)

  const mini = [];
  const tsi = [];

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
              date.getDate() +
              '/' +
              (date.getMonth() + 1) +
              '/' +
              date.getFullYear() +
              ' : ' +
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