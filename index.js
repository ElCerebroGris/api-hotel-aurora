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

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
