const SandboxBanner = () => {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50">
      <div className="bg-yellow-100">
        <div className="px-2.5 py-2.5 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <p className="font-medium text-center text-yellow-600 truncate">
            You are currently in Sandbox mode.
          </p>
        </div>
      </div>
    </div>
  )
}

export default SandboxBanner
