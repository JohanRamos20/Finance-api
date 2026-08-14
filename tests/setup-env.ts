import { config } from "dotenv"

const result = config({
    path: ".env.test",
    override: true
})

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
    throw new Error("DATABASE_URL de teste não definida");
}

const databaseName = new URL(databaseUrl)
    .pathname
    .replace("/", "")

if (!databaseName.endsWith("_test")) {
    throw new Error(
        `Testes não podem executar no banco "${databaseName}"`
    );
}




