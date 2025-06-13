export default function MainPage() {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-4">欢迎来到主页</h1>
        <p>这是一个 Server Component，在服务器端渲染。</p>
        <p>当前时间：{new Date().toLocaleString()}</p>
      </div>
    )
  }