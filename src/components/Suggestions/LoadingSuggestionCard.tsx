const LoadingSuggestionCard = () => {
  return (
    <div className="relative w-full px-6 pt-6 pb-4 font-medium border border-gray-200 rounded-md cursor-pointer sm:w-44 xl:w-48 animate-pulse">
      <div className="w-full">
        <div className="w-12 h-12 mx-auto mb-3 bg-gray-200 rounded"></div>
        <div className="w-2/3 h-3.5 mx-auto mb-2 bg-gray-400 rounded-sm"></div>
        <div className="w-1/3 h-3 mx-auto uppercase bg-gray-300 rounded-sm"></div>
      </div>
    </div>
  )
}

export default LoadingSuggestionCard
