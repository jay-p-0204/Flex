import React from "react";
import { Layout } from "antd";

const { Header } = Layout;

const Navbar = () => {
  return (
    <>
      <Layout>
        <Header
          style={{
            position: "absolute",
            top: 0,
            zIndex: 1,
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <h2 style={{ color: "white" }}>Dashboard</h2>
        </Header>
      </Layout>
    </>
  );
};

export default Navbar;
