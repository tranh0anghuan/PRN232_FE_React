import toast from "react-hot-toast"

// Success toast configuration
export const showSuccessToast = (message: string) => {
  toast.success(message, {
    duration: 3000,
    position: "top-right",
    style: {
      background: "#10B981", // green-500
      color: "#ffffff",
      padding: "16px",
      borderRadius: "8px",
      fontSize: "14px",
      fontWeight: "500",
    },
    iconTheme: {
      primary: "#ffffff",
      secondary: "#10B981",
    },
  })
}

// Error toast configuration
export const showErrorToast = (message: string) => {
  toast.error(message, {
    duration: 5000,
    position: "top-right",
    style: {
      background: "#EF4444", // red-500
      color: "#ffffff",
      padding: "16px",
      borderRadius: "8px",
      fontSize: "14px",
      fontWeight: "500",
    },
    iconTheme: {
      primary: "#ffffff",
      secondary: "#EF4444",
    },
  })
}

// Info toast configuration
export const showInfoToast = (message: string) => {
  toast(message, {
    duration: 4000,
    position: "top-right",
    style: {
      background: "#3B82F6", // blue-500
      color: "#ffffff",
      padding: "16px",
      borderRadius: "8px",
      fontSize: "14px",
      fontWeight: "500",
    },
    icon: "ℹ️",
  })
}

// Loading toast configuration
export const showLoadingToast = (message: string) => {
  return toast.loading(message, {
    position: "top-right",
    style: {
      background: "#6B7280", // gray-500
      color: "#ffffff",
      padding: "16px",
      borderRadius: "8px",
      fontSize: "14px",
      fontWeight: "500",
    },
  })
}
