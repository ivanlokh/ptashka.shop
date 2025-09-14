import AdminLayout from '@/components/admin/AdminLayout';
import { Package, Users, ShoppingCart, TrendingUp } from 'lucide-react';

const stats = [
  {
    name: 'Всього товарів',
    value: '1,234',
    change: '+12%',
    changeType: 'positive',
    icon: Package,
  },
  {
    name: 'Користувачі',
    value: '5,678',
    change: '+8%',
    changeType: 'positive',
    icon: Users,
  },
  {
    name: 'Замовлення',
    value: '2,345',
    change: '+15%',
    changeType: 'positive',
    icon: ShoppingCart,
  },
  {
    name: 'Дохід',
    value: '₴1,234,567',
    change: '+23%',
    changeType: 'positive',
    icon: TrendingUp,
  },
];

const recentOrders = [
  {
    id: 'ORD-001',
    customer: 'Іван Петренко',
    amount: '₴2,500',
    status: 'Обробляється',
    date: '2025-09-14',
  },
  {
    id: 'ORD-002',
    customer: 'Марія Коваленко',
    amount: '₴1,800',
    status: 'Відправлено',
    date: '2025-09-13',
  },
  {
    id: 'ORD-003',
    customer: 'Олексій Сидоренко',
    amount: '₴3,200',
    status: 'Доставлено',
    date: '2025-09-12',
  },
];

export default function AdminDashboard() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Панель управління</h1>
          <p className="mt-1 text-sm text-gray-500">
            Огляд статистики та управління магазином
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <stat.icon className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {stat.name}
                      </dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">
                          {stat.value}
                        </div>
                        <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                          stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {stat.change}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Orders */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Останні замовлення
            </h3>
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Замовлення
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Клієнт
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Сума
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Статус
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Дата
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentOrders.map((order) => (
                    <tr key={order.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {order.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.customer}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.amount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.date}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Швидкі дії
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <button className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-500 rounded-lg border border-gray-200 hover:border-gray-300">
                <div>
                  <span className="rounded-lg inline-flex p-3 bg-primary-50 text-primary-700 ring-4 ring-white">
                    <Package className="h-6 w-6" />
                  </span>
                </div>
                <div className="mt-4">
                  <h3 className="text-lg font-medium">
                    <span className="absolute inset-0" />
                    Додати товар
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Створити новий товар для магазину
                  </p>
                </div>
              </button>

              <button className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-500 rounded-lg border border-gray-200 hover:border-gray-300">
                <div>
                  <span className="rounded-lg inline-flex p-3 bg-primary-50 text-primary-700 ring-4 ring-white">
                    <Users className="h-6 w-6" />
                  </span>
                </div>
                <div className="mt-4">
                  <h3 className="text-lg font-medium">
                    <span className="absolute inset-0" />
                    Управління користувачами
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Переглянути та керувати користувачами
                  </p>
                </div>
              </button>

              <button className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-500 rounded-lg border border-gray-200 hover:border-gray-300">
                <div>
                  <span className="rounded-lg inline-flex p-3 bg-primary-50 text-primary-700 ring-4 ring-white">
                    <ShoppingCart className="h-6 w-6" />
                  </span>
                </div>
                <div className="mt-4">
                  <h3 className="text-lg font-medium">
                    <span className="absolute inset-0" />
                    Замовлення
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Переглянути всі замовлення
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
