import { Request, Response } from "express";
import { container } from "tsyringe";

import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";
import { ProfileMap } from "@modules/users/mappers/ProfileMap";

export class ShowUserProfileController {
  async execute(request: Request, response: Response) {
    const { id } = request.user;

    const showUserProfile = container.resolve(ShowUserProfileUseCase);

    const user = await showUserProfile.execute(id);

    const profileDTO = ProfileMap.toDTO(user);

    return response.json(profileDTO);
  }
}
