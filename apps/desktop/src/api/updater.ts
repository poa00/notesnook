/*
This file is part of the Notesnook project (https://notesnook.com/)

Copyright (C) 2023 Streetwriters (Private) Limited

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

import { initTRPC } from "@trpc/server";
import { observable } from "@trpc/server/observable";
import { CancellationToken, autoUpdater } from "electron-updater";
import type { AppUpdaterEvents } from "electron-updater/out/AppUpdater";
import { z } from "zod";
import { config } from "../utils/config";

type UpdateInfo = { version: string };
type Progress = { percent: number };

const t = initTRPC.create();
let cancellationToken: CancellationToken | undefined = undefined;

export const updaterRouter = t.router({
  autoUpdates: t.procedure.query(() => config.automaticUpdates),
  install: t.procedure.query(() => autoUpdater.quitAndInstall()),
  download: t.procedure.query(async () => {
    if (cancellationToken) return;
    cancellationToken = new CancellationToken();
    await autoUpdater
      .downloadUpdate(cancellationToken)
      .finally(() => (cancellationToken = undefined));
  }),
  check: t.procedure.query(async () => {
    await autoUpdater.checkForUpdates().catch(console.error);
  }),

  toggleAutoUpdates: t.procedure
    .input(z.object({ enabled: z.boolean() }))
    .mutation(({ input: { enabled } }) => {
      config.automaticUpdates = enabled;
    }),

  onChecking: createSubscription("checking-for-update"),
  onDownloaded: createSubscription<"update-downloaded", UpdateInfo>(
    "update-downloaded"
  ),
  onDownloadProgress: createSubscription<"download-progress", Progress>(
    "download-progress"
  ),
  onNotAvailable: createSubscription<"update-not-available", UpdateInfo>(
    "update-not-available"
  ),
  onAvailable: createSubscription<"update-available", UpdateInfo>(
    "update-available",
    () => {
      if (!config.automaticUpdates) return false;
      autoUpdater.emit("download-progress", {
        bytesPerSecond: 0,
        delta: 0,
        percent: 0,
        total: 100,
        transferred: 0
      });
      return true;
    }
  ),
  onError: createSubscription("error")
});

function createSubscription<
  TName extends keyof AppUpdaterEvents,
  TReturnType = Parameters<AppUpdaterEvents[TName]>[0]
>(eventName: TName, handler?: (args: TReturnType) => boolean) {
  return t.procedure.subscription(() => {
    return observable<TReturnType>((emit) => {
      const listener: AppUpdaterEvents[TName] = (...args: any[]) => {
        if (handler?.(args[0])) return;
        emit.next(args[0]);
      };
      autoUpdater.removeAllListeners(eventName);
      autoUpdater.addListener(eventName, listener);
      return () => {
        autoUpdater.removeListener(eventName, listener);
      };
    });
  });
}
