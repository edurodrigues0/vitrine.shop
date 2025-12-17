import type { Request, Response } from "express";
import { auth } from "~/services/auth";

export async function googleSignInController(
  request: Request,
  response: Response
) {
  try {
    const { redirect, url } = await auth.api.signInSocial({
      body: {
        provider: "google",
      },
    });

    if (redirect && url) {
      // 🔑 OAuth = redirect
      return response.redirect(302, url);
    }


    return response.status(404);
  } catch (error) {
    console.error(error);
    return response.status(500).send("Erro ao iniciar login com Google");
  }
}
