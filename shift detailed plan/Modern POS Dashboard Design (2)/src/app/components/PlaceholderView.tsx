interface PlaceholderViewProps {
  title: string;
  description: string;
  icon: React.ReactNode;
}

export function PlaceholderView({ title, description, icon }: PlaceholderViewProps) {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="backdrop-blur-xl bg-white/60 rounded-3xl p-12 border border-white/40 shadow-xl text-center max-w-md">
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-6 shadow-lg">
          {icon}
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-3">{title}</h2>
        <p className="text-gray-600 text-lg">{description}</p>
        <button className="mt-8 px-8 py-3 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105">
          Coming Soon
        </button>
      </div>
    </div>
  );
}
