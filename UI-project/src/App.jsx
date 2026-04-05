import React, { useState } from 'react';
import { Layout, Menu, Button, Table, Modal, Input, Tag, Card, Row, Col, Form as AntForm, Switch, ConfigProvider, theme } from 'antd';
import { 
  DashboardOutlined, DatabaseOutlined, SettingOutlined, UserOutlined, 
  PlusOutlined, CalendarOutlined, TeamOutlined, BulbOutlined, MoonOutlined 
} from '@ant-design/icons';
import { useForm, Controller } from 'react-hook-form';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar
} from 'recharts';
import './App.css';

const { Header, Sider, Content } = Layout;

let nextId = 4;

// --- MOCK DATA ---
const initialTableData = [
  { id: '1', pipelineName: 'User Event Ingestion', status: 'Success', records: 45000, lastRun: '2026-04-01 10:00' },
  { id: '2', pipelineName: 'Sales Data ETL', status: 'Processing', records: 12000, lastRun: '2026-04-01 14:30' },
  { id: '3', pipelineName: 'Log Aggregation', status: 'Failed', records: 0, lastRun: '2026-04-01 09:15' },
];

// Data Volume (Nhiều đường, dao động mạnh)
const chartData = [
  { time: '08:00', kafkaStream: 4000, sparkBatch: 2400, apiGateway: 1200 },
  { time: '10:00', kafkaStream: 3000, sparkBatch: 1398, apiGateway: 2210 },
  { time: '12:00', kafkaStream: 5500, sparkBatch: 6800, apiGateway: 3290 },
  { time: '14:00', kafkaStream: 2780, sparkBatch: 3908, apiGateway: 2000 },
  { time: '16:00', kafkaStream: 7890, sparkBatch: 4800, apiGateway: 4181 },
  { time: '18:00', kafkaStream: 5390, sparkBatch: 8800, apiGateway: 2500 },
  { time: '20:00', kafkaStream: 9400, sparkBatch: 4300, apiGateway: 5100 },
];

// Geography / Campaign Data cho BarChart
const geoData = [
  { region: 'North America', traffic: 4000, campaigns: 24 },
  { region: 'Europe', traffic: 3000, campaigns: 13 },
  { region: 'Asia Pacific', traffic: 8000, campaigns: 48 },
  { region: 'Latin America', traffic: 2780, campaigns: 19 },
];

export default function App() {
  // States hệ thống
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // State điều hướng Menu
  const [activeTab, setActiveTab] = useState('overview');

  // States dữ liệu
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [tableData, setTableData] = useState(initialTableData);

  const { control, handleSubmit, reset, formState: { errors } } = useForm();

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-100">
        <Card className="w-96 shadow-xl rounded-2xl border-none">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-extrabold text-blue-600 mb-2">Data Platform</h2>
            <p className="text-slate-500">Đăng nhập để truy cập hệ thống</p>
          </div>
          <Button type="primary" block size="large" icon={<UserOutlined />} onClick={() => setIsAuthenticated(true)} className="bg-blue-600">
            Truy cập ẩn danh
          </Button>
        </Card>
      </div>
    );
  }

  const columns = [
    { title: 'Tên Pipeline', dataIndex: 'pipelineName', key: 'pipelineName', render: (text) => <span className="font-semibold text-blue-500">{text}</span> },
    { title: 'Trạng thái', dataIndex: 'status', key: 'status', render: (status) => {
        let color = status === 'Success' ? 'green' : status === 'Failed' ? 'red' : 'blue';
        return <Tag color={color}>{status.toUpperCase()}</Tag>;
    }},
    { title: 'Số bản ghi', dataIndex: 'records', key: 'records', sorter: (a, b) => a.records - b.records },
    { title: 'Lần chạy cuối', dataIndex: 'lastRun', key: 'lastRun' },
  ];

  const onSubmit = (data) => {
    const newPipeline = {
      id: (nextId++).toString(),
      pipelineName: data.pipelineName,
      status: 'Processing',
      records: 0,
      lastRun: new Date().toLocaleString(),
    };
    setTableData([newPipeline, ...tableData]);
    setIsModalVisible(false);
    reset();
  };

  // Các biến Tailwind linh hoạt theo Dark/Light Mode
  const bgCard = isDarkMode ? "bg-[#141414] border-[#303030]" : "bg-white border-slate-100";
  const textHeading = isDarkMode ? "text-white" : "text-slate-700";
  const textSub = isDarkMode ? "text-gray-400" : "text-slate-500";

  // === RENDER TỪNG MÀN HÌNH (ROUTING) ===
  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
            {/* Top Cards */}
            <Row gutter={[24, 24]}>
              <Col xs={24} sm={8}>
                <Card bordered={false} className={`${isDarkMode ? 'bg-blue-900/20' : 'bg-gradient-to-br from-blue-50 to-blue-100'} shadow-sm hover:-translate-y-1 transition-all rounded-2xl border-none`}>
                  <p className="text-blue-500 font-semibold mb-1 uppercase text-xs">Tổng Pipeline</p>
                  <h2 className={`text-4xl font-extrabold m-0 ${isDarkMode ? 'text-blue-400' : 'text-blue-800'}`}>{tableData.length}</h2>
                </Card>
              </Col>
              <Col xs={24} sm={8}>
                <Card bordered={false} className={`${isDarkMode ? 'bg-emerald-900/20' : 'bg-gradient-to-br from-emerald-50 to-emerald-100'} shadow-sm hover:-translate-y-1 transition-all rounded-2xl border-none`}>
                  <p className="text-emerald-500 font-semibold mb-1 uppercase text-xs">Bản ghi đã xử lý</p>
                  <h2 className={`text-4xl font-extrabold m-0 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-800'}`}>
                    {tableData.reduce((acc, curr) => acc + curr.records, 0).toLocaleString()}
                  </h2>
                </Card>
              </Col>
              <Col xs={24} sm={8}>
                <Card bordered={false} className={`${isDarkMode ? 'bg-rose-900/20' : 'bg-gradient-to-br from-rose-50 to-rose-100'} shadow-sm hover:-translate-y-1 transition-all rounded-2xl border-none`}>
                  <p className="text-rose-500 font-semibold mb-1 uppercase text-xs">Cảnh báo lỗi</p>
                  <h2 className={`text-4xl font-extrabold m-0 ${isDarkMode ? 'text-rose-400' : 'text-rose-800'}`}>
                    {tableData.filter(d => d.status === 'Failed').length}
                  </h2>
                </Card>
              </Col>
            </Row>

            {/* Line Chart: Multi-line Data Volume */}
            <div className={`p-6 rounded-2xl shadow-sm border ${bgCard}`}>
              <h3 className={`text-lg font-bold mb-6 ${textHeading}`}>Data Ingestion Volume (Multi-source)</h3>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#333' : '#e2e8f0'} />
                    <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                    <Tooltip contentStyle={{ backgroundColor: isDarkMode ? '#1f1f1f' : '#fff', borderRadius: '8px', border: 'none' }} />
                    <Legend iconType="circle" />
                    <Line type="monotone" name="Kafka Streams" dataKey="kafkaStream" stroke="#3b82f6" strokeWidth={3} dot={{r:3}} activeDot={{r:6}} />
                    <Line type="monotone" name="Spark Batch" dataKey="sparkBatch" stroke="#10b981" strokeWidth={3} dot={{r:3}} activeDot={{r:6}} />
                    <Line type="monotone" name="API Gateway" dataKey="apiGateway" stroke="#f59e0b" strokeWidth={3} dot={{r:3}} activeDot={{r:6}} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Geography & Campaign Stats (Bar Chart) */}
            <Row gutter={[24, 24]}>
              <Col xs={24} lg={12}>
                <div className={`p-6 rounded-2xl shadow-sm border h-full ${bgCard}`}>
                  <h3 className={`text-lg font-bold mb-6 ${textHeading}`}>Geography Traffic</h3>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={geoData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={isDarkMode ? '#333' : '#e2e8f0'} />
                        <XAxis type="number" hide />
                        <YAxis dataKey="region" type="category" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} width={100} />
                        <Tooltip cursor={{fill: isDarkMode ? '#333' : '#f1f5f9'}} contentStyle={{ backgroundColor: isDarkMode ? '#1f1f1f' : '#fff', borderRadius: '8px', border: 'none' }} />
                        <Bar dataKey="traffic" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={20} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </Col>
              <Col xs={24} lg={12}>
                <div className={`p-6 rounded-2xl shadow-sm border h-full ${bgCard}`}>
                  <h3 className={`text-lg font-bold mb-4 ${textHeading}`}>Active Campaigns</h3>
                  <div className="space-y-4">
                    {geoData.map((item, index) => (
                      <div key={index} className={`flex justify-between items-center p-4 rounded-xl ${isDarkMode ? 'bg-[#1f1f1f]' : 'bg-slate-50'}`}>
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                          <span className={`font-medium ${textHeading}`}>Chiến dịch {item.region}</span>
                        </div>
                        <span className="font-bold text-blue-500">{item.campaigns} Active</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Col>
            </Row>
          </div>
        );
      
      case 'pipelines':
        return (
          <div className={`p-6 rounded-2xl shadow-sm border animate-fade-in ${bgCard}`}>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className={`text-lg font-bold m-0 ${textHeading}`}>Quản lý ETL Pipelines</h3>
                <p className={`text-sm mt-1 ${textSub}`}>Theo dõi và khởi tạo các tiến trình xử lý dữ liệu</p>
              </div>
              <Button type="primary" size="large" icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)} className="bg-blue-600">
                Thêm Pipeline
              </Button>
            </div>
            <Table columns={columns} dataSource={tableData} rowKey="id" pagination={{ pageSize: 5 }} />
          </div>
        );

      case 'profile':
        return (
          <div className={`p-8 rounded-2xl shadow-sm border text-center animate-fade-in ${bgCard}`}>
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserOutlined className="text-4xl text-blue-600" />
            </div>
            <h2 className={`text-2xl font-bold ${textHeading}`}>Hồ sơ cá nhân</h2>
            <p className={textSub}>Tính năng đang được phát triển...</p>
          </div>
        );

      case 'calendar':
        return (
          <div className={`p-8 rounded-2xl shadow-sm border animate-fade-in ${bgCard}`}>
            <h2 className={`text-2xl font-bold mb-4 ${textHeading}`}>Lịch biểu</h2>
            <p className={textSub}>Lịch chạy các tiến trình Batch Data sẽ hiển thị ở đây.</p>
          </div>
        );

      case 'team':
        return (
          <div className={`p-8 rounded-2xl shadow-sm border animate-fade-in ${bgCard}`}>
            <h2 className={`text-2xl font-bold mb-4 ${textHeading}`}>Quản lý Team</h2>
            <p className={textSub}>Danh sách các Data Engineer tham gia dự án.</p>
          </div>
        );

      default:
        return <div>Chức năng đang phát triển</div>;
    }
  };

  return (
    // Bọc toàn bộ App bằng ConfigProvider của Ant Design để đổi Theme
    <ConfigProvider theme={{ algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm }}>
      <Layout className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-[#000000]' : 'bg-[#f8fafc]'}`}>
        
        {/* SIDEBAR */}
        <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)} theme={isDarkMode ? "dark" : "light"} className="border-r border-slate-100">
          <div className="h-10 m-4 bg-gradient-to-r from-blue-600 to-blue-400 rounded-lg flex items-center justify-center text-white font-bold tracking-widest shadow-md">
            {collapsed ? 'DE' : 'DATA DE'}
          </div>
          <Menu 
            theme={isDarkMode ? "dark" : "light"} 
            mode="inline"
            selectedKeys={[activeTab]} // Lắng nghe Tab đang chọn
            onClick={(e) => setActiveTab(e.key)} // Đổi Tab khi click
            items={[
              { key: 'overview', icon: <DashboardOutlined />, label: 'Overview' },
              { key: 'pipelines', icon: <DatabaseOutlined />, label: 'Pipelines' },
              { type: 'divider' },
              { key: 'profile', icon: <UserOutlined />, label: 'Profile' },
              { key: 'calendar', icon: <CalendarOutlined />, label: 'Lịch biểu' },
              { key: 'team', icon: <TeamOutlined />, label: 'Manage Team' },
              { type: 'divider' },
              { key: 'settings', icon: <SettingOutlined />, label: 'Cài đặt' }
            ]}
          />
        </Sider>

        <Layout className="bg-transparent">
          {/* HEADER CÓ NÚT DARK MODE */}
          <Header className={`flex justify-between items-center px-6 shadow-sm z-10 ${isDarkMode ? 'bg-[#141414] border-b border-[#303030]' : 'bg-white'}`}>
            <h1 className={`text-xl font-bold m-0 ${textHeading}`}>
              {activeTab === 'overview' ? 'Analytics Dashboard' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
            </h1>
            <div className="flex items-center gap-6">
              {/* Nút bật tắt chế độ sáng tối */}
              <div className="flex items-center gap-2">
                <BulbOutlined className={isDarkMode ? 'text-gray-500' : 'text-yellow-500'} />
                <Switch checked={isDarkMode} onChange={(checked) => setIsDarkMode(checked)} />
                <MoonOutlined className={isDarkMode ? 'text-blue-400' : 'text-gray-400'} />
              </div>
              <Button danger type={isDarkMode ? "primary" : "default"} onClick={() => setIsAuthenticated(false)}>Đăng xuất</Button>
            </div>
          </Header>

          {/* MAIN CONTENT THAY ĐỔI THEO TAB */}
          <Content className="m-6">
            {renderContent()}
          </Content>
        </Layout>

        {/* MODAL THÊM PIPELINE */}
        <Modal title="Tạo Pipeline Mới" open={isModalVisible} onCancel={() => { setIsModalVisible(false); reset(); }} footer={null}>
          <AntForm layout="vertical" onFinish={handleSubmit(onSubmit)} className="mt-4">
            <AntForm.Item label="Tên Pipeline" validateStatus={errors.pipelineName ? "error" : ""} help={errors.pipelineName?.message}>
              <Controller
                name="pipelineName"
                control={control}
                rules={{ required: 'Vui lòng nhập tên Pipeline' }}
                render={({ field }) => <Input {...field} placeholder="VD: Kafka to S3 Ingestion" />}
              />
            </AntForm.Item>
            <div className="flex justify-end gap-2 mt-6">
              <Button onClick={() => setIsModalVisible(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit">Khởi tạo</Button>
            </div>
          </AntForm>
        </Modal>

      </Layout>
    </ConfigProvider>
  );
}