import AccountModel from "../model/account.model"
import ConvoModel from "../model/convo.model"

export interface PaginatedClients {
  data: {
    _id: string
    name: string
    email: string
    profile: string
    type: string
  }[]
  total: number
  page: number
  totalPages: number
  limit: number
}

const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")


export class ClientDirectoryService {

  static async getArtistClients(
    artistId: string,
    options: { page?: number; limit?: number; search?: string } = {}
  ): Promise<PaginatedClients> {

    const rawLimit = Number(options.limit)
    const limit = Number.isFinite(rawLimit)
      ? Math.min(Math.max(Math.trunc(rawLimit), 1), 50)
      : 10

    const search = (options.search ?? "").trim()

    const convos = await ConvoModel.find({ accounts: artistId }).select("accounts").lean()
    const clientIds = new Set<string>()
    for (const convo of convos) {
      for (const account of (convo.accounts as unknown[])) {
        const id = String(account)
        if (id !== String(artistId)) clientIds.add(id)
      }
    }

    const filter: Record<string, unknown> = {
      _id: { $in: Array.from(clientIds) },
      type: "client",
    }

    if (search) {
      const rx = new RegExp(escapeRegex(search), "i")
      filter.$or = [{ name: rx }, { email: rx }]
    }

    const total = await AccountModel.countDocuments(filter)
    const totalPages = Math.max(Math.ceil(total / limit), 1)

    const rawPage = Number(options.page)
    const page = Number.isFinite(rawPage)
      ? Math.min(Math.max(Math.trunc(rawPage), 1), totalPages)
      : 1

    const docs = await AccountModel.find(filter)
      .select("name email profile type")
      .sort({ name: 1, _id: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()

    const data = docs.map((doc: any) => ({
      _id: String(doc._id),
      name: doc.name,
      email: doc.email,
      profile: doc.profile,
      type: doc.type,
    }))

    return { data, total, page, totalPages, limit }
  }
}
