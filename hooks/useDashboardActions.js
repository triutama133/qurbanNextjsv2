"use client"

import { useState } from "react"
import supabase from "@/lib/supabase"
import { readFileAsBase64 } from "@/lib/utils"

export function useDashboardActions({
  user,
  profile,
  appConfig,
  personalTotalRecorded,
  personalUsed,
  setPersonalSavingHistory,
  setPersonalTotalRecorded,
  setPersonalUsed,
  setPersonalTransferConfirmations,
  setUserHelpDeskTickets,
  setProfile,
  formatRupiah,
}) {
  // Loading states for forms
  const [addSavingLoading, setAddSavingLoading] = useState(false)
  const [useSavingLoading, setUseSavingLoading] = useState(false)
  const [confirmTransferLoading, setConfirmTransferLoading] = useState(false)
  const [helpDeskFormLoading, setHelpDeskFormLoading] = useState(false)

  // Ambil user dari localStorage jika tidak ada di props
  const getUserId = () => {
    if (user && user.id) return user.id;
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem("qurban_user");
      if (userStr) {
        try {
          const u = JSON.parse(userStr);
          return u.id;
        } catch {}
      }
    }
    return null;
  };

  const handleAddSaving = async (e) => {
    e.preventDefault()
    setAddSavingLoading(true)
    const amountInput = e.target.elements.amount
    const amount = Number.parseFloat(amountInput.value.replace(/[^0-9]/g, ""))
    const savingMessageEl = document.getElementById("savingMessage")

    if (profile?.IsInitialDepositMade && profile?.InitialDepositStatus !== "Approved") {
      savingMessageEl.textContent =
        "Setoran awal Anda belum diverifikasi admin. Harap tunggu verifikasi sebelum mencatat tabungan rutin."
      savingMessageEl.className = "text-sm mt-3 text-yellow-600"
      setAddSavingLoading(false)
      return
    }

    if (isNaN(amount) || amount <= 0) {
      savingMessageEl.textContent = "Jumlah tabungan tidak valid."
      savingMessageEl.className = "text-sm mt-3 text-red-600"
      setAddSavingLoading(false)
      return
    }

    let proofUrl = null
    if (profile?.MetodeTabungan === "Setor ke Tim") {
      const proofFile = e.target.elements.proofFile?.files[0]
      if (!proofFile) {
        savingMessageEl.textContent = "Bukti setor wajib diunggah untuk metode ini."
        savingMessageEl.className = "text-sm mt-3 text-red-600"
        setAddSavingLoading(false)
        return
      }
      try {
        const fileData = {
          name: proofFile.name,
          mimeType: proofFile.type,
          data: await readFileAsBase64(proofFile),
        }
        const uploadResponse = await fetch("/api/upload-file", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(fileData),
        })
        const uploadResult = await uploadResponse.json()
        if (!uploadResponse.ok || uploadResult.error) {
          throw new Error(uploadResult.error || "Gagal mengunggah bukti.")
        }
        proofUrl = uploadResult.fileUrl
      } catch (uploadErr) {
        throw new Error(`Gagal mengunggah bukti: ${uploadErr.message}`)
      }
    }

    try {
      savingMessageEl.textContent = "Menyimpan..."
      savingMessageEl.className = "text-sm mt-3 text-gray-600"

      const newTransactionId = `TRX-${Date.now()}`
      const newTanggal = new Date().toISOString()

      const { data, error } = await supabase.from("tabungan").insert({
        TransaksiId: newTransactionId,
        UserId: getUserId(),
        Jumlah: amount,
        Metode: profile.MetodeTabungan,
        Tanggal: newTanggal,
        Tipe: "Setoran",
        Status: "Confirmed",
        ProofLink: proofUrl,
        VerificationStatus: null,
      })

      if (error) {
        throw error
      }

      setPersonalSavingHistory((prev) =>
        [
          {
            TransaksiId: newTransactionId,
            UserId: getUserId(),
            Jumlah: amount,
            Metode: profile.MetodeTabungan,
            Tanggal: newTanggal,
            Tipe: "Setoran",
            Status: "Confirmed",
            ProofLink: proofUrl,
            VerificationStatus: null,
          },
          ...prev,
        ].sort((a, b) => new Date(b.Tanggal) - new Date(a.Tanggal)),
      )
      setPersonalTotalRecorded((prev) => prev + amount)

      savingMessageEl.textContent = "Tabungan berhasil dicatat!"
      savingMessageEl.className = "text-sm mt-3 text-green-600"
      e.target.reset()
    } catch (err) {
      console.error("Error adding saving:", err.message)
      savingMessageEl.textContent = "Gagal mencatat tabungan: " + err.message
      savingMessageEl.className = "text-sm mt-3 text-red-600"
    } finally {
      setAddSavingLoading(false)
    }
  }

  const handleUseSaving = async (e) => {
    e.preventDefault()
    setUseSavingLoading(true)
    const usedAmountInput = e.target.elements.usedAmount
    const usedAmount = Number.parseFloat(usedAmountInput.value.replace(/[^0-9]/g, ""))
    const usedMessageEl = document.getElementById("usedMessage")

    const currentNetSaving = personalTotalRecorded - personalUsed

    if (isNaN(usedAmount) || usedAmount <= 0) {
      usedMessageEl.textContent = "Jumlah penggunaan tidak valid."
      usedMessageEl.className = "text-sm mt-3 text-red-600"
      setUseSavingLoading(false)
      return
    }
    if (usedAmount > currentNetSaving) {
      usedMessageEl.textContent = `Jumlah penggunaan melebihi tabungan tersedia (${formatRupiah(currentNetSaving)}).`
      usedMessageEl.className = "text-sm mt-3 text-red-600"
      setUseSavingLoading(false)
      return
    }

    try {
      usedMessageEl.textContent = "Mencatat penggunaan..."
      usedMessageEl.className = "text-sm mt-3 text-gray-600"

      const newTransactionId = `USE-${Date.now()}`
      const newTanggal = new Date().toISOString()

      const { data, error } = await supabase.from("tabungan").insert({
        TransaksiId: newTransactionId,
        UserId: getUserId(),
        Jumlah: usedAmount,
        Tanggal: newTanggal,
        Tipe: "Penggunaan",
        Status: "Confirmed",
        Metode: null,
        ProofLink: null,
        VerificationStatus: null,
      })

      if (error) {
        throw error
      }

      setPersonalSavingHistory((prev) =>
        [
          {
            TransaksiId: newTransactionId,
            UserId: user.id,
            Jumlah: usedAmount,
            Tanggal: newTanggal,
            Tipe: "Penggunaan",
            Status: "Confirmed",
            Metode: null,
            ProofLink: null,
            VerificationStatus: null,
          },
          ...prev,
        ].sort((a, b) => new Date(b.Tanggal) - new Date(a.Tanggal)),
      )
      setPersonalUsed((prev) => prev + usedAmount)

      usedMessageEl.textContent = "Penggunaan tabungan berhasil dicatat!"
      usedMessageEl.className = "text-sm mt-3 text-green-600"
      e.target.reset()
    } catch (err) {
      console.error("Error using saving:", err.message)
      usedMessageEl.textContent = "Gagal mencatat penggunaan tabungan: " + err.message
      usedMessageEl.className = "text-sm mt-3 text-red-600"
    } finally {
      setUseSavingLoading(false)
    }
  }

  const handleInitialDeposit = async (e) => {
    e.preventDefault()
    const initialProofFile = e.target.elements.initialProofFile?.files[0]
    const initialMessageEl = document.getElementById("initialMessage")

    if (!initialProofFile) {
      initialMessageEl.textContent = "Bukti transfer wajib diunggah."
      initialMessageEl.className = "text-sm mt-3 text-red-600"
      return
    }

    try {
      initialMessageEl.textContent = "Mengunggah bukti & Mencatat Setoran Awal..."
      initialMessageEl.className = "text-sm mt-3 text-gray-600"

      const newTransactionId = `INIT-${Date.now()}`
      const fileData = {
        name: initialProofFile.name,
        mimeType: initialProofFile.type,
        data: await readFileAsBase64(initialProofFile),
        userId: getUserId(),
        transactionId: newTransactionId,
      }
      const uploadResponse = await fetch("/api/upload-file", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fileData),
      })
      const uploadResult = await uploadResponse.json()
      if (!uploadResponse.ok || uploadResult.error) {
        throw new Error(uploadResult.error || "Gagal mengunggah bukti setoran awal.")
      }
      const proofUrl = uploadResult.fileUrl

      const newTanggal = new Date().toISOString()

      const { data: savingData, error: savingError } = await supabase.from("tabungan").insert({
        TransaksiId: newTransactionId,
        UserId: getUserId(),
        Jumlah: appConfig.InitialDepositAmount,
        Metode: "Setoran Awal",
        Tanggal: newTanggal,
        Tipe: "Setoran",
        Status: "Confirmed",
        ProofLink: proofUrl,
        VerificationStatus: "Pending",
      })

      if (savingError) {
        throw savingError
      }

      const { error: updateError } = await supabase
        .from("users")
        .update({ IsInitialDepositMade: true, InitialDepositStatus: "Pending" })
        .eq("UserId", getUserId())

      if (updateError) {
        throw updateError
      }

      initialMessageEl.textContent = "Setoran Awal berhasil dicatat! Menunggu verifikasi."
      initialMessageEl.className = "text-sm mt-3 text-green-600"
      e.target.reset()
      setProfile((prevProfile) => ({ ...prevProfile, IsInitialDepositMade: true, InitialDepositStatus: "Pending" }))
      setPersonalSavingHistory((prev) =>
        [
          {
            TransaksiId: newTransactionId,
            UserId: getUserId(),
            Jumlah: appConfig.InitialDepositAmount,
            Metode: "Setoran Awal",
            Tanggal: newTanggal,
            Tipe: "Setoran",
            Status: "Confirmed",
            ProofLink: proofUrl,
            VerificationStatus: "Pending",
          },
          ...prev,
        ].sort((a, b) => new Date(b.Tanggal) - new Date(a.Tanggal)),
      )
      setPersonalTotalRecorded((prev) => prev + appConfig.InitialDepositAmount)
    } catch (err) {
      console.error("Error initial deposit:", err.message)
      initialMessageEl.textContent = "Gagal mencatat setoran awal: " + err.message
      initialMessageEl.className = "text-sm mt-3 text-red-600"
    }
  }

  const handleConfirmTransfer = async (e) => {
    e.preventDefault()
    setConfirmTransferLoading(true)
    const transferAmountInput = e.target.elements.transferAmount
    const transferAmount = Number.parseFloat(transferAmountInput.value.replace(/[^0-9]/g, ""))
    const transferProofFile = e.target.elements.transferProofFile?.files[0]
    const confirmMessageEl = document.getElementById("confirmMessage")

    const targetAmount = profile?.TargetPribadi || 2650000

    if (transferAmount !== targetAmount) {
      confirmMessageEl.textContent = `Jumlah transfer harus tepat ${formatRupiah(targetAmount)}.`
      confirmMessageEl.className = "text-sm mt-3 text-red-600"
      setConfirmTransferLoading(false)
      return
    }

    if (personalTotalRecorded < targetAmount) {
      confirmMessageEl.textContent = `Dana tercatat belum mencapai target transfer ${formatRupiah(targetAmount)}.`
      confirmMessageEl.className = "text-sm mt-3 text-red-600"
      setConfirmTransferLoading(false)
      return
    }

    try {
      confirmMessageEl.textContent = "Mengunggah bukti transfer..."
      confirmMessageEl.className = "text-sm mt-3 text-gray-600"

      const newConfirmationId = `CONF-${Date.now()}`
      const fileData = {
        name: transferProofFile.name,
        mimeType: transferProofFile.type,
        data: await readFileAsBase64(transferProofFile),
        userId: getUserId(),
        transactionId: newConfirmationId,
      }
      const uploadResponse = await fetch("/api/upload-file", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fileData),
      })
      const uploadResult = await uploadResponse.json()
      if (!uploadResponse.ok || uploadResult.error) {
        throw new Error(uploadResult.error || "Gagal mengunggah bukti.")
      }
      const proofUrl = uploadResult.fileUrl

      const newTimestamp = new Date().toISOString()

      const { data, error } = await supabase.from("transfer_confirmations").insert({
        ConfirmationId: newConfirmationId,
        UserId: getUserId(),
        Amount: transferAmount,
        ProofLink: proofUrl,
        Timestamp: newTimestamp,
        Status: "Pending",
        Notes: "Konfirmasi transfer cicilan pribadi",
      })

      if (error) {
        throw error
      }

      setPersonalTransferConfirmations((prev) =>
        [
          {
            ConfirmationId: newConfirmationId,
            UserId: getUserId(),
            Amount: transferAmount,
            ProofLink: proofUrl,
            Timestamp: newTimestamp,
            Status: "Pending",
            Notes: "Konfirmasi transfer cicilan pribadi",
          },
          ...prev,
        ].sort((a, b) => new Date(b.Timestamp) - new Date(a.Timestamp)),
      )

      confirmMessageEl.textContent = "Konfirmasi transfer berhasil dikirim. Menunggu verifikasi admin."
      confirmMessageEl.className = "text-sm mt-3 text-green-600"
      e.target.reset()
    } catch (err) {
      console.error("Error confirming transfer:", err.message)
      confirmMessageEl.textContent = "Gagal mengirim konfirmasi transfer: " + err.message
      confirmMessageEl.className = "text-sm mt-3 text-red-600"
    } finally {
      setConfirmTransferLoading(false)
    }
  }

  const handleHelpDeskSubmit = async (e) => {
    e.preventDefault()
    setHelpDeskFormLoading(true)
    const questionInput = e.target.elements.question
    const question = questionInput.value.trim()
    const helpDeskMessageEl = document.getElementById("helpDeskMessage")

    if (!question) {
      helpDeskMessageEl.textContent = "Pertanyaan tidak boleh kosong."
      helpDeskMessageEl.className = "text-sm mt-3 text-red-600"
      setHelpDeskFormLoading(false)
      return
    }

    try {
      helpDeskMessageEl.textContent = "Mengirim pertanyaan..."
      helpDeskMessageEl.className = "text-sm mt-3 text-gray-600"

      const newTicketId = `TICKET-${Date.now()}`
      const newTimestamp = new Date().toISOString()

      const { data, error } = await supabase.from("help_desk_tickets").insert({
        TicketId: newTicketId,
        UserId: getUserId(),
        Question: question,
        Timestamp: newTimestamp,
        Status: "Open",
      })

      if (error) {
        throw error
      }

      setUserHelpDeskTickets((prev) =>
        [
          {
            TicketId: newTicketId,
            UserId: getUserId(),
            Question: question,
            Timestamp: newTimestamp,
            Status: "Open",
            AdminResponse: null,
            AdminUserId: null,
            ResponseTimestamp: null,
          },
          ...prev,
        ].sort((a, b) => new Date(b.Timestamp) - new Date(a.Timestamp)),
      )

      helpDeskMessageEl.textContent = "Pertanyaan berhasil dikirim. Admin akan segera merespons."
      helpDeskMessageEl.className = "text-sm mt-3 text-green-600"
      e.target.reset()
    } catch (err) {
      console.error("Error submitting help desk ticket:", err.message)
      helpDeskMessageEl.textContent = "Gagal mengirim pertanyaan: " + err.message
      helpDeskMessageEl.className = "text-sm mt-3 text-red-600"
    } finally {
      setHelpDeskFormLoading(false)
    }
  }

  const showConfirmModal = (transactionId) => {
    if (confirm("Anda yakin ingin menghapus catatan tabungan ini?")) {
      handleDeleteSaving(transactionId)
    }
  }

  const handleEditTransaction = async (updatedTransaction) => {
    try {
      const { error } = await supabase
        .from("tabungan")
        .update({
          Jumlah: updatedTransaction.Jumlah,
          Tanggal: updatedTransaction.Tanggal,
        })
        .eq("TransaksiId", updatedTransaction.TransaksiId)
        .eq("UserId", user.id)

      if (error) {
        throw error
      }

      // Update local state
      setPersonalSavingHistory((prev) => {
        const updated = prev
          .map((item) =>
            item.TransaksiId === updatedTransaction.TransaksiId
              ? { ...item, Jumlah: updatedTransaction.Jumlah, Tanggal: updatedTransaction.Tanggal }
              : item,
          )
          .sort((a, b) => new Date(b.Tanggal) - new Date(a.Tanggal))

        // Recalculate totals
        let newTotalRecorded = 0
        let newTotalUsed = 0
        updated.forEach((item) => {
          if (item.Tipe === "Setoran") {
            newTotalRecorded += item.Jumlah || 0
          } else if (item.Tipe === "Penggunaan") {
            newTotalUsed += item.Jumlah || 0
          }
        })
        setPersonalTotalRecorded(newTotalRecorded)
        setPersonalUsed(newTotalUsed)

        return updated
      })

      console.log("Transaksi berhasil diperbarui:", updatedTransaction.TransaksiId)
    } catch (err) {
      console.error("Error editing transaction:", err.message)
      alert("Gagal memperbarui transaksi: " + err.message)
    }
  }

  const handleDeleteSaving = async (transactionId) => {
    try {
      // Ambil data transaksi yang akan dihapus (termasuk ProofLink)
      const { data: trxData, error: trxError } = await supabase
        .from("tabungan")
        .select("Tipe, Metode, ProofLink")
        .eq("TransaksiId", transactionId)
        .eq("UserId", getUserId())
        .single()
      if (trxError) throw trxError

      const { error } = await supabase.from("tabungan").delete().eq("TransaksiId", transactionId).eq("UserId", getUserId())
      if (error) {
        throw error
      }

      // Jika ada ProofLink, hapus file dari Google Storage
      if (trxData?.ProofLink) {
        try {
          await fetch("/api/delete-file", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fileUrl: trxData.ProofLink }),
          })
        } catch (delErr) {
          console.error("Gagal menghapus file dari storage:", delErr)
        }
      }

      // Jika yang dihapus adalah setoran awal, reset status di profile user
      if (trxData?.Tipe === "Setoran" && trxData?.Metode === "Setoran Awal") {
        const { error: userError } = await supabase
          .from("users")
          .update({ IsInitialDepositMade: false, InitialDepositStatus: null })
          .eq("UserId", getUserId())
        if (userError) throw userError
        setProfile((prev) => ({ ...prev, IsInitialDepositMade: false, InitialDepositStatus: null }))
      }
      console.log("Catatan berhasil dihapus:", transactionId)
      setPersonalSavingHistory((prev) => {
        const updatedHistory = prev.filter((item) => item.TransaksiId !== transactionId)
        let newTotalRecorded = 0
        let newTotalUsed = 0
        updatedHistory.forEach((item) => {
          if (item.Tipe === "Setoran") {
            newTotalRecorded += item.Jumlah || 0
          } else if (item.Tipe === "Penggunaan") {
            newTotalUsed += item.Jumlah || 0
          }
        })
        setPersonalTotalRecorded(newTotalRecorded)
        setPersonalUsed(newTotalUsed)
        return updatedHistory
      })
    } catch (err) {
      console.error("Error deleting saving:", err.message)
      alert("Gagal menghapus catatan: " + err.message)
    }
  }

  // Handler untuk menghapus transfer ke panitia (dan file bukti transfer)
  const handleDeleteTransferConfirmation = async (confirmationId) => {
    try {
      // Ambil data transfer yang akan dihapus (termasuk ProofLink)
      const { data: confData, error: confError } = await supabase
        .from("transfer_confirmations")
        .select("ProofLink")
        .eq("ConfirmationId", confirmationId)
        .eq("UserId", getUserId())
        .single()
      if (confError) throw confError

      const { error } = await supabase
        .from("transfer_confirmations")
        .delete()
        .eq("ConfirmationId", confirmationId)
        .eq("UserId", getUserId())
      if (error) throw error

      // Jika ada ProofLink, hapus file dari Google Storage
      if (confData?.ProofLink) {
        try {
          await fetch("/api/delete-file", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fileUrl: confData.ProofLink }),
          })
        } catch (delErr) {
          console.error("Gagal menghapus file bukti transfer dari storage:", delErr)
        }
      }

      setPersonalTransferConfirmations((prev) => prev.filter((item) => item.ConfirmationId !== confirmationId))
    } catch (err) {
      console.error("Error deleting transfer confirmation:", err.message)
      alert("Gagal menghapus catatan transfer: " + err.message)
    }
  }

  return {
    // Loading states
    addSavingLoading,
    useSavingLoading,
    confirmTransferLoading,
    helpDeskFormLoading,

    // Action handlers
    handleAddSaving,
    handleUseSaving,
    handleInitialDeposit,
    handleConfirmTransfer,
    handleHelpDeskSubmit,
    showConfirmModal,
    handleEditTransaction,
    handleDeleteSaving,
    handleDeleteTransferConfirmation,
  }
}
