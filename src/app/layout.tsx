<body
  className="font-body"
  style={{
    margin: 0,
    padding: 0,
    boxSizing: "border-box",
    backgroundColor: "#F9F9F9",
    minHeight: "100vh",
  }}
>
  <AuthProvider>
    {children}
  </AuthProvider>
</body>
