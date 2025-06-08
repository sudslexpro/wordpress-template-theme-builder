import { Palette, FileCode, Globe, Upload } from 'lucide-react';

interface DashboardStatsProps {
  themesCount: number;
  templatesCount: number;
  wordpressSitesCount: number;
  deploymentsCount: number;
}

export default function DashboardStats({
  themesCount,
  templatesCount,
  wordpressSitesCount,
  deploymentsCount,
}: DashboardStatsProps) {
  const stats = [
    {
      name: 'Themes',
      value: themesCount,
      icon: Palette,
      href: '/dashboard/themes',
      color: 'bg-blue-100 text-blue-600',
    },
    {
      name: 'Templates',
      value: templatesCount,
      icon: FileCode,
      href: '/dashboard/templates',
      color: 'bg-green-100 text-green-600',
    },
    {
      name: 'WordPress Sites',
      value: wordpressSitesCount,
      icon: Globe,
      href: '/dashboard/wordpress-sites',
      color: 'bg-purple-100 text-purple-600',
    },
    {
      name: 'Deployments',
      value: deploymentsCount,
      icon: Upload,
      href: '/dashboard/deployments',
      color: 'bg-amber-100 text-amber-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <a
          key={stat.name}
          href={stat.href}
          className="bg-card rounded-lg shadow p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center">
            <div className={`p-3 rounded-full ${stat.color}`}>
              <stat.icon className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">
                {stat.name}
              </p>
              <p className="text-2xl font-semibold">{stat.value}</p>
            </div>
          </div>
        </a>
      ))}
    </div>
  );
}