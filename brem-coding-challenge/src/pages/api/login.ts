// pages/api/login.ts
import { lucia } from "../../auth";
import { Argon2id } from "oslo/password";
import sqlite from 'sqlite';
import type { APIContext } from "astro";

export async function POST(context: APIContext): Promise<Response> {
    const formData = await context.request.formData();
    const username = formData.get("username");

    if (
        typeof username !== "string" ||
        username.length < 3 ||
        username.length > 31 ||
        !/^[a-z0-9_-]+$/.test(username)
    ) {
        return new Response("Invalid username", {
            status: 400
        });
    }

    const password = formData.get("password");

    if (typeof password !== "string" || password.length < 6 || password.length > 255) {
        return new Response("Invalid password", {
            status: 400
        });
    }

    const db = await sqlite.open({
        filename: ":memory:", // or specify a file path for a persistent database
        driver: sqlite.Database
    });

    const existingUser = await db.get(
        'SELECT * FROM your_table_name WHERE username = ?',
        [username.toLowerCase()]
    );

    if (!existingUser) {
        return new Response("Incorrect username or password", {
            status: 400
        });
    }

    const validPassword = await new Argon2id().verify(existingUser.password, password);

    if (!validPassword) {
        return new Response("Incorrect username or password", {
            status: 400
        });
    }
    

    const session = await lucia.createSession(username, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    context.cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);

    return context.redirect("/");
}
