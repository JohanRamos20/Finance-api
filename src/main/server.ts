import { app } from "./app"
import { connectRedis } from "../infrastructure/cache/redis-client";
import { makeListeners } from "../infrastructure/http/factories/listeners-factory";

const PORT = process.env.PORT ?? 3000;

async function bootstrap() {
    await connectRedis();
    console.log("Redis conectado!");

    makeListeners();
    console.log("Listeners iniciados");
    
    app.listen(PORT, () => {
    console.log(`Server rodando na porta ${PORT}`)
});

}

bootstrap()

