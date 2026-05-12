export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Supply Chain Protocol
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Decentralized visibility and coordination for global supply chains
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-2">Visibility Layer</h3>
              <p className="text-gray-600">Shared, append-only event log with cryptographic anchoring</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-2">Interoperability</h3>
              <p className="text-gray-600">Canonical data schema with system adapters</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-2">ZK Attestations</h3>
              <p className="text-gray-600">Privacy-preserving compliance proofs</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-2">Programmable Settlement</h3>
              <p className="text-gray-600">Automated payments on event verification</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-2">Resilience Graph</h3>
              <p className="text-gray-600">Network risk analysis and concentration mapping</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-2">GS1 Compatible</h3>
              <p className="text-gray-600">Built on existing supply chain standards</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
