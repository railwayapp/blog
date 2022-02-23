const Code = ({ children, language = "javascript" }) => {
  return (
    <>
      <pre>
        <code>{children}</code>
      </pre>
    </>
  )
}

export default Code
