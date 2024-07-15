import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import { Button, FloatButton, Switch, Modal, Space, Form, Input, Select, Row, Col, Empty } from 'antd';
import { Layout, Model } from 'flexlayout-react';
import Chart from 'react-apexcharts';
import { useTheme } from '../src/context/ThemeContext';
import 'flexlayout-react/style/light.css';
import './App.css';

const App = () => {
  useEffect(() => {
    console.log('Component mounted');
  }, []);

  const [open, setOpen] = useState(false);
  const [buttonType, setButtonType] = useState('submit');
  const [componentSize, setComponentSize] = useState('default');
  const [chartData, setChartData] = useState(null);
  const [categories, setCategories] = useState('');
  const [curve, setCurve] = useState('smooth');
  const [horizontalBar, setHorizontalBar] = useState(false);

  const [type, setType] = useState('line');
  const [series, setSeries] = useState('');
  const [labels, setLabels] = useState('');
  const [title, setTitle] = useState('');
  const [seriesName, setSeriesName] = useState('Series 1');

  const { theme, toggleTheme } = useTheme();

  const resetFields = () => {
    setType('line');
    setSeries('');
    setTitle('');
    setSeriesName('Series 1');
    setCategories('');
    setLabels('');
  };

  const initialModelJson = {
    global: {},
    borders: [],
    layout: {
      type: 'row',
      weight: 100,
      children: [
        {
          type: 'tabset',
          weight: 50,
          children: [
            {
              type: 'tab',
              name: 'Panel 1',
              component: 'panel1',
            },
          ],
          selected: 0,
        },
        {
          type: 'tabset',
          weight: 50,
          children: [
            {
              type: 'tab',
              name: 'Panel 2',
              component: 'panel2',
            },
          ],
          selected: 0,
        },
      ],
    },
  };

  const [model, setModel] = useState(Model.fromJson(initialModelJson));

  const [activePanel, setActivePanel] = useState('panel1');

  const handlePanelClick = (panel) => {
    console.log(`${panel} clicked`);
    setActivePanel(panel);
  };

  const factory = (node) => {
    const component = node.getComponent();
    switch (component) {
      case 'panel1':
        return (
          <div
            style={{ height: '100%' }}
            onClick={() => handlePanelClick('panel1')}
          >
            Content of Panel 1
          </div>
        );
      case 'panel2':
        return (
          <div
            style={{ height: '100%' }}
            onClick={() => handlePanelClick('panel2')}
          >
            Content of Panel 2
          </div>
        );
      case 'chart':
        return chartData && buttonType === 'submit' ? (
          <div>
            <h2>{chartData.title}</h2>
            <Chart
              options={{
                chart: {
                  type: chartData.type,
                },
                stroke: {
                  curve: chartData.curve,
                },
                plotOptions: {
                  bar: {
                    horizontal: chartData.horizontalBar,
                  },
                },
                xaxis: {
                  categories: chartData.categories,
                },
                labels: chartData.labels,
              }}
              series={
                chartData.type === 'pie' || chartData.type === 'donut'
                  ? chartData.series
                  : [{ name: chartData.seriesName, data: chartData.series }]
              }
              type={chartData.type}
              width='100%'
              height='300vh'
            />
          </div>
        ) : (
          ' '
        );
      default:
        return <div>Unknown component</div>;
    }
  };

  const showModal = () => {
    setOpen(true);
  };

  const handleCancel = () => {
    setOpen(false);
    resetFields();
  };

  const onFormLayoutChange = ({ size }) => {
    setComponentSize(size);
  };

  const handleSubmit = () => {
    const formData = {
      type,
      series:
        type === 'pie' || type === 'donut'
          ? series.split(',').map((num) => parseFloat(num.trim()))
          : series.split(',').map((num) => parseFloat(num.trim())),
      title,
      curve,
      seriesName,
      horizontalBar,
      categories: categories.split(',').map((cat) => cat.trim()),
      labels: labels.split(',').map((lab) => lab.trim()),
    };
    setChartData(formData);
    console.log(formData, 'formData');

    if (buttonType === 'submit') {
      
      const updatedModel = model.toJson();

      let activeTabset = null;
      updatedModel.layout.children.forEach((tabset) => {
        if (tabset.children.some((child) => child.component === activePanel)) {
          activeTabset = tabset;
        }
      });

      if (activeTabset) {
        activeTabset.children.push({
          type: 'tab',
          name: formData.title,
          component: 'chart',
        });
        activeTabset.selected = activeTabset.children.length - 1;
      } else {
        updatedModel.layout.children.push({
          type: 'row',
          weight: 50,
          children: [
            {
              type: 'tabset',
              weight: 50,
              children: [
                {
                  type: 'tab',
                  name: formData.title,
                  component: 'chart',
                },
              ],
              selected: 0,
            },
          ],
        });
      }

      setModel(Model.fromJson(updatedModel));

      setOpen(false);
      resetFields();
    } else {
      setOpen(true);
    }
  };

  return (
    <>
      <Navbar />
      <div style={{ position: 'fixed', zIndex: '10', top: 18, right: 17 }}>
        <Switch onChange={toggleTheme} />
      </div>
      <div>
        <div
          style={{
            height: 'calc(100vh - 64px)',
            marginTop: '65px',
            position: 'relative',
          }}
        >
          <Layout model={model} factory={factory} className={theme} />
        </div>
      </div>
      <FloatButton onClick={showModal} />
      <Modal
        open={open}
        title='Generate Chart'
        onCancel={handleCancel}
        footer={null}
        width={1000}
        className={theme}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form
              labelCol={{
                span: 8,
              }}
              wrapperCol={{
                span: 16,
              }}
              layout='horizontal'
              initialValues={{
                size: componentSize,
              }}
              onValuesChange={onFormLayoutChange}
              size={componentSize}
              style={{
                maxWidth: 800,
              }}
              onFinish={handleSubmit}
            >
              <Form.Item label='Select Chart Type'>
                <Select
                  value={type}
                  onChange={(value) => setType(value)}
                  required
                >
                  <Select.Option value='line'>Line</Select.Option>
                  <Select.Option value='bar'>Bar</Select.Option>
                  <Select.Option value='area'>Area</Select.Option>
                  <Select.Option value='pie'>Pie</Select.Option>
                  <Select.Option value='donut'>Donut</Select.Option>
                </Select>
              </Form.Item>

              {type === 'line' || type === 'area' ? (
                <Form.Item label='Select Stroke'>
                  <Select
                    value={curve}
                    onChange={(value) => setCurve(value)}
                    required
                  >
                    <Select.Option value='smooth'>Smooth</Select.Option>
                    <Select.Option value='straight'>Straight</Select.Option>
                    <Select.Option value='stepline'>Stepline</Select.Option>
                  </Select>
                </Form.Item>
              ) : null}

              <Form.Item label='Chart Title'>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </Form.Item>
              <Form.Item label='Series Name'>
                <Input
                  value={seriesName}
                  onChange={(e) => setSeriesName(e.target.value)}
                  required
                />
              </Form.Item>
              {type === 'bar' ? (
                <Form.Item label='Horizontal Bar'>
                  <Select
                    value={horizontalBar}
                    onChange={(value) => setHorizontalBar(value)}
                    required
                  >
                    <Select.Option value={true}>True</Select.Option>
                    <Select.Option value={false}>False</Select.Option>
                  </Select>
                </Form.Item>
              ) : null}

              {(type === 'line' || type === 'bar' || type === 'area') && (
                <Form.Item label='Categories'>
                  <Input
                    value={categories}
                    onChange={(e) => setCategories(e.target.value)}
                    required
                  />
                </Form.Item>
              )}
              {(type === 'pie' || type === 'donut') && (
                <Form.Item label='Labels'>
                  <Input
                    value={labels}
                    onChange={(e) => setLabels(e.target.value)}
                    required
                  />
                </Form.Item>
              )}
              <Form.Item label='Series Data'>
                <Input
                  value={series}
                  onChange={(e) => setSeries(e.target.value)}
                  required
                />
              </Form.Item>
              <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                <Space>
                  <Button
                    htmlType='submit'
                    type='primary'
                    onClick={() => setButtonType('submit')}
                  >
                    Submit
                  </Button>
                  <Button
                    type='primary'
                    htmlType='submit'
                    onClick={() => setButtonType('preview')}
                  >
                    Preview
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Col>
          {buttonType === 'preview' ? (
            <Col span={12}>
              {chartData && (
                <div>
                  <h2>{chartData.title}</h2>
                  <Chart
                    options={{
                      chart: {
                        type: chartData.type,
                      },
                      stroke: {
                        curve: chartData.curve,
                      },
                      plotOptions: {
                        bar: {
                          horizontal: chartData.horizontalBar,
                        },
                      },
                      xaxis: {
                        categories: chartData.categories,
                      },
                      labels: chartData.labels,
                    }}
                    series={
                      chartData.type === 'pie' || chartData.type === 'donut'
                        ? chartData.series
                        : [{ name: chartData.seriesName, data: chartData.series }]
                    }
                    type={chartData.type}
                    width='100%'
                    height='300vh'
                  />
                </div>
              )}
            </Col>
          ) : (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Empty style={{ marginLeft: '180px' }} />
            </div>
          )}
        </Row>
      </Modal>
    </>
  );
};

export default App;
