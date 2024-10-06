const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const funcionariosRoutes = require("./routes/funcionarios");
const utilizadoresRoutes = require("./routes/utilizadores");
const quartosRoutes = require("./routes/quartos");
const servicosRoutes = require("./routes/servicos");
const reservasRoutes = require("./routes/reservas");
const pagamentosRoutes = require("./routes/pagamentos");

const app = express();
const PORT = 3000;
app.use(cors()); // Habilita CORS para todas as rotas
app.use(bodyParser.json());

app.use("/funcionarios", funcionariosRoutes);
app.use("/utilizadores", utilizadoresRoutes);
app.use("/quartos", quartosRoutes);
app.use("/servicos", servicosRoutes);
app.use("/reservas", reservasRoutes);
app.use("/pagamentos", pagamentosRoutes);

// Add this to the very top of the first file loaded in your app
var apm = require("elastic-apm-node").start({
  serviceName: "my-service-name",
  secretToken: "zkHRYRHYcUJ7iDUTwi",
  serverUrl:
    "https://d75d8ed7a3e946b891ff3d76d37ae297.apm.us-central1.gcp.cloud.es.io:443",
  environment: "my-environment",
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
