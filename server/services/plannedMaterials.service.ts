import { isWholeNumberUnit } from "../model/inventory.model";
import { InventoryService } from "./inventory.service";
import { plannedSessionMaterialsSchema } from "../validation/booking.schema";
import { PlannedSessionMaterials } from "../types/booking.type";

export class PlannedMaterialsError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

const round2 = (n: number) => Math.round(n * 100) / 100;

const parseJson = (raw: unknown) => {
  if (typeof raw !== "string") return raw;
  try {
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
};

export class PlannedMaterialsService {
  static async normalize(
    raw: unknown,
    owner: string,
    sessionCount: number,
  ): Promise<{
    sessionMaterials: PlannedSessionMaterials[];
    itemUsed: { itemId: string; item: string; qty: number }[];
  } | null> {
    if (raw === undefined || raw === null || raw === "" || raw === "none") {
      return null;
    }
    const parsed = plannedSessionMaterialsSchema.safeParse(parseJson(raw));
    if (!parsed.success) {
      throw new PlannedMaterialsError(
        400,
        parsed.error.issues[0]?.message ?? "Invalid session materials",
      );
    }
    if (parsed.data.length !== sessionCount) {
      throw new PlannedMaterialsError(
        400,
        "Materials must be listed for each planned session",
      );
    }

    const ids = [...new Set(parsed.data.flat().map((m) => m.itemId))];
    const items = ids.length
      ? await InventoryService.getManyForAccount(ids, owner)
      : [];
    const byId = new Map(items.map((i) => [i._id.toString(), i]));

    const totals = new Map<string, { item: string; qty: number }>();
    const sessionMaterials = parsed.data.map((materials, index) => ({
      session: index + 1,
      items: materials.map((m) => {
        const item = byId.get(m.itemId);
        if (!item) {
          throw new PlannedMaterialsError(
            400,
            "One of the selected materials is not in this inventory",
          );
        }
        if (isWholeNumberUnit(item.type) && !Number.isInteger(m.qty)) {
          throw new PlannedMaterialsError(
            400,
            `${item.item} is counted in ${item.type}; enter a whole number`,
          );
        }
        const total = totals.get(m.itemId);
        totals.set(m.itemId, {
          item: item.item,
          qty: round2((total?.qty ?? 0) + m.qty),
        });
        return {
          itemId: m.itemId,
          item: item.item,
          unit: item.type,
          qty: m.qty,
        };
      }),
    }));

    return {
      sessionMaterials,
      itemUsed: [...totals.entries()].map(([itemId, t]) => ({
        itemId,
        item: t.item,
        qty: t.qty,
      })),
    };
  }
}
