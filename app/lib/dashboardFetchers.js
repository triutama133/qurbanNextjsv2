import { supabase } from "@/lib/supabase"

// --- Data Fetching Logic ---
export const fetchUserAndInit = async (router) => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      router.push("/login")
      return null
    }
    return user
  } catch (err) {
    console.error("Dashboard fetch error - user:", err)
    throw new Error(err.message || "Terjadi kesalahan yang tidak diketahui.")
  }
}

export const fetchProfile = async (userId) => {
  try {
    const { data: profileData, error: profileError } = await supabase
      .from("users")
      .select('*, "NamaPequrban", "StatusPequrban", "Benefits", "IsInitialDepositMade"')
      .eq("UserId", userId)
      .single()
    if (profileError || !profileData) throw new Error(profileError?.message || "Data profil tidak ditemukan.")
    return profileData
  } catch (err) {
    console.error("Error fetching profile:", err)
    throw new Error(err.message || "Gagal memuat profil.")
  }
}

export const fetchGlobalConfigSection = async () => {
  try {
    const { data: configData, error: configError } = await supabase
      .from("app_config")
      .select("*")
      .eq("id", "global_settings")
      .single()
    if (configError || !configData)
      throw new Error(configError?.message || "Data konfigurasi global tidak ditemukan.")
    return configData
  } catch (err) {
    console.error("Error fetching global config:", err)
    throw new Error(err.message || "Gagal memuat konfigurasi global.")
  }
}

export const fetchPersonalSectionData = async (userId, currentProfile, currentGlobalConfig) => {
  try {
    const { data: savingHistoryData, error: savingHistoryError } = await supabase
      .from('tabungan')
      .select('*')
      .eq('UserId', userId)
      .order('Tanggal', { ascending: false });
    if (savingHistoryError) throw savingHistoryError;
    
    let totalRecorded = 0;
    let totalUsed = 0;
    savingHistoryData.forEach(item => {
        if (item.Tipe === 'Setoran') {
            totalRecorded += (item.Jumlah || 0);
        } else if (item.Tipe === 'Penggunaan') {
            totalUsed += (item.Jumlah || 0);
        }
    });

    const { data: transferData, error: transferError } = await supabase
        .from('transfer_confirmations')
        .select('*')
        .eq('UserId', userId)
        .eq('Status', 'Approved')
        .order('Timestamp', { ascending: false });
    if (transferError) throw transferError;
    
    let totalTransferredApproved = transferData.reduce((sum, item) => sum + (item.Amount || 0), 0);

    // --- PERBAIKAN: Tambahkan Setoran Awal yang Approved ke total transferred ---
    if (currentProfile?.InitialDepositStatus === 'Approved' && currentGlobalConfig?.InitialDepositAmount) {
        totalTransferredApproved += currentGlobalConfig.InitialDepositAmount;
    }
    // --- AKHIR PERBAIKAN ---

    return {
      savingHistory: savingHistoryData,
      totalRecorded,
      totalUsed,
      transferConfirmations: transferData,
      totalTransferred: totalTransferredApproved,
    }
  } catch (err) {
    console.error("fetchPersonalSectionData error:", err)
    throw new Error(err.message || "Gagal memuat data keuangan pribadi.")
  }
}

export const fetchNewsSection = async (supabase, page = 1) => {
  const NEWS_PER_PAGE = 3
  try {
    const offset = (page - 1) * NEWS_PER_PAGE
    const {
      data: newsData,
      error: newsError,
      count,
    } = await supabase
      .from("newsletters")
      .select("*", { count: "exact" })
      .order("DatePublished", { ascending: false })
      .range(offset, offset + NEWS_PER_PAGE - 1)
    if (newsError) throw newsError
    return { newsData, count }
  } catch (err) {
    console.error("Error fetching news:", err)
    throw new Error(err.message || "Gagal memuat berita.")
  }
}

export const fetchDocumentsSection = async () => {
  try {
    const { data: documentsData, error: documentsError } = await supabase
      .from("app_resources")
      .select("*")
      .eq("IsActive", true)
      .order("CreatedAt", { ascending: false })

    if (documentsError) {
      if (documentsError.code === "PGRST116") return []
      throw documentsError
    }
    return documentsData || []
  } catch (err) {
    console.error("Error fetching documents:", err.message)
    throw new Error("Gagal memuat dokumen.")
  }
}

export const fetchMilestonesSection = async () => {
  try {
    const { data: milestonesData, error: milestonesError } = await supabase
      .from("program_milestones")
      .select("*")
      .order("Year", { ascending: true })
      .order("Order", { ascending: true })
    if (milestonesError) {
      if (milestonesError.code === "PGRST116") return []
      throw milestonesError
    }
    return milestonesData
  } catch (err) {
    console.error("Error fetching milestones:", err.message)
    throw new Error("Gagal memuat milestone.")
  }
}

export const fetchHelpDeskTicketsSection = async (userId) => {
  try {
    const { data: ticketsData, error: ticketsError } = await supabase
      .from("help_desk_tickets")
      .select("*")
      .eq("UserId", userId)
      .order("Timestamp", { ascending: false })
    if (ticketsError) throw ticketsError
    return ticketsData
  } catch (err) {
    console.error("Error fetching help desk tickets:", err.message)
    throw new Error("Gagal memuat tiket helpdesk.")
  }
}

export const fetchResourcesSection = async (userId) => {
  try {
    const { data: resourcesData, error: resourcesError } = await supabase
      .from('app_resources')
      .select('*')
      .or(`IsGlobal.eq.true,UserId.eq.${userId}`) // Global OR specific to user
      .order('CreatedAt', { ascending: false });
    
    if (resourcesData === null) { 
        return [];
    } else if (resourcesError) {
        throw resourcesError;
    } else {
        return resourcesData;
    }
  } catch (err) {
    console.error("fetchResourcesSection error:", err);
    throw new Error("Gagal memuat dokumen dan sumber daya.");
  }
}