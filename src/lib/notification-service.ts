import { db } from "./db";

interface NotifyAdminsParams {
  title: string;
  message: string;
  type: string;
  link?: string;
  provinsiId?: number | null;
  kabupatenId?: number | null;
}

export async function notifyAdmins({
  title,
  message,
  type,
  link,
  provinsiId,
  kabupatenId,
}: NotifyAdminsParams) {
  try {
    // Determine which roles get this notification based on the context
    // 1. SUPER_ADMIN and ADMIN_NASIONAL get EVERYTHING
    const targetRoles = ["SUPER_ADMIN", "ADMIN_NASIONAL"];
    const targetConditions: any[] = [{ role: { in: targetRoles } }];

    // 2. ADMIN_PROVINSI gets notifications if it's for their provinsi (or if it has no specific wilayah = global)
    if (provinsiId) {
      targetConditions.push({
        role: "ADMIN_PROVINSI",
        provinsiId: provinsiId,
      });
    }

    // 3. ADMIN_KABUPATEN gets notifications if it's for their kabupaten
    if (kabupatenId) {
      targetConditions.push({
        role: "ADMIN_KABUPATEN",
        kabupatenId: kabupatenId,
      });
    }

    // Find all users that match the conditions
    const targetUsers = await db.user.findMany({
      where: {
        OR: targetConditions,
        status: "Aktif",
      },
      select: { id: true },
    });

    if (targetUsers.length === 0) return;

    // Create notifications for all matched users
    await db.notification.createMany({
      data: targetUsers.map((user) => ({
        userId: user.id,
        title,
        message,
        type,
        link,
      })),
    });
  } catch (error) {
    console.error("Failed to notify admins:", error);
  }
}
