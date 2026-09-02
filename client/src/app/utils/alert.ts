import Swal from "sweetalert2"
import { toast } from "sonner"
import React from "react"

export const successAlert = (text: string) => {
  toast.custom(() =>
    React.createElement(
      "div",
      {
        style: {
          position: "relative",
          display: "flex",
          alignItems: "flex-start",
          gap: "16px",
          background: "#121212",
          border: "1px solid #242424",
          padding: "16px 20px",
          overflow: "hidden",
          width: "360px",
          fontFamily: "system-ui, sans-serif",
        },
      },
      React.createElement("div", { style: { position: "absolute", left: 0, top: 0, height: "100%", width: "2px", background: "#C9A84C" } }),
      React.createElement("div", { style: { position: "absolute", top: 0, right: 0, width: "24px", height: "24px", borderTop: "1px solid #C9A84C", borderRight: "1px solid #C9A84C", opacity: 0.4 } }),
     
      React.createElement(
        "div",
        {
          style: {
            flexShrink: 0,
            width: "32px",
            height: "32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "1px solid #C9A84C",
            background: "rgba(201,168,76,0.08)",
          },
        },
        React.createElement(
          "svg",
          { width: 15, height: 15, viewBox: "0 0 24 24", fill: "none", stroke: "#C9A84C", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" },
          React.createElement("path", { d: "M22 11.08V12a10 10 0 1 1-5.93-9.14" }),
          React.createElement("polyline", { points: "22 4 12 14.01 9 11.01" })
        )
      ),
      React.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: "2px", minWidth: 0 } },
        React.createElement("p", {
          style: { margin: 0, fontSize: "14px", fontWeight: 300, letterSpacing: "0.06em", color: "#F2EDE4", fontFamily: "'Cormorant Garamond', serif" },
        }, "Success"),
        React.createElement("p", {
          style: { margin: 0, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.14em", color: "#7A7570", lineHeight: 1.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
        }, text)
      )
    )
  )
}

export const errorAlert = (text: string) => {
  toast.custom(() =>
    React.createElement(
      "div",
      {
        style: {
          position: "relative",
          display: "flex",
          alignItems: "flex-start",
          gap: "16px",
          background: "#121212",
          border: "1px solid #242424",
          padding: "16px 20px",
          overflow: "hidden",
          width: "360px",
          fontFamily: "system-ui, sans-serif",
        },
      },
      React.createElement("div", { style: { position: "absolute", left: 0, top: 0, height: "100%", width: "2px", background: "#8B3A3A" } }),
      React.createElement("div", { style: { position: "absolute", top: 0, right: 0, width: "24px", height: "24px", borderTop: "1px solid #8B3A3A", borderRight: "1px solid #8B3A3A", opacity: 0.4 } }),
      
      React.createElement(
        "div",
        {
          style: {
            flexShrink: 0,
            width: "32px",
            height: "32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "1px solid #8B3A3A",
            background: "rgba(139,58,58,0.08)",
          },
        },
        React.createElement(
          "svg",
          { width: 15, height: 15, viewBox: "0 0 24 24", fill: "none", stroke: "#C26060", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" },
          React.createElement("circle", { cx: 12, cy: 12, r: 10 }),
          React.createElement("line", { x1: 15, y1: 9, x2: 9, y2: 15 }),
          React.createElement("line", { x1: 9, y1: 9, x2: 15, y2: 15 })
        )
      ),
      React.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: "2px", minWidth: 0 } },
        React.createElement("p", {
          style: { margin: 0, fontSize: "14px", fontWeight: 300, letterSpacing: "0.06em", color: "#F2EDE4", fontFamily: "'Cormorant Garamond', serif" },
        }, "Error"),
        React.createElement("p", {
          style: { margin: 0, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.14em", color: "#7A7570", lineHeight: 1.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
        }, text)
      )
    )
  )
}


export const confirmAlert = (
  text: string,
  buttonText: string,
  callback: () => void
) => {
  Swal.fire({
    title: 'Are you sure?',
    text: text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: buttonText,
    cancelButtonText: 'Cancel',
    buttonsStyling: false,

    didOpen: () => {
      const popup = Swal.getPopup();
      const confirmBtn = Swal.getConfirmButton();
      const cancelBtn = Swal.getCancelButton();

      if (popup) {
        popup.style.borderRadius = '0px';
        popup.style.border = '1px solid #242424';
        popup.style.backgroundColor = '#1A1A1A';
        popup.style.padding = '32px';
        popup.style.display = 'flex';
        popup.style.flexDirection = 'column';
        popup.style.alignItems = 'center';
        popup.style.boxShadow = '0 0 60px rgba(201,168,76,0.08)';

        // Style the title
        const title = popup.querySelector('.swal2-title') as HTMLElement;
        if (title) {
          title.style.color = '#F2EDE4';
          title.style.fontFamily = "'Cormorant Garamond', serif";
          title.style.fontWeight = '300';
          title.style.fontSize = '1.75rem';
          title.style.letterSpacing = '-0.02em';
        }

        // Style the content text
        const content = popup.querySelector('.swal2-html-container') as HTMLElement;
        if (content) {
          content.style.color = '#7A7570';
          content.style.fontSize = '0.875rem';
          content.style.fontFamily = 'inherit';
        }

        // Style the warning icon
        const icon = popup.querySelector('.swal2-icon') as HTMLElement;
        if (icon) {
          icon.style.borderColor = '#C9A84C';
          icon.style.color = '#C9A84C';
        }
      }

      if (confirmBtn && cancelBtn) {
        const wrapper = document.createElement('div');
        wrapper.style.display = 'flex';
        wrapper.style.gap = '12px';
        wrapper.style.marginTop = '20px';

        confirmBtn.parentNode?.insertBefore(wrapper, confirmBtn);
        wrapper.appendChild(confirmBtn);
        wrapper.appendChild(cancelBtn);
      }

      const baseStyle: Partial<CSSStyleDeclaration> = {
        padding: '8px 20px',
        borderRadius: '0px',
        cursor: 'pointer',
        fontWeight: '400',
        fontSize: '10px',
        letterSpacing: '0.2em',
        textTransform: 'uppercase',
        transition: 'all 0.3s ease',
        fontFamily: 'inherit',
      };

      if (confirmBtn) {
        Object.assign(confirmBtn.style, baseStyle);
        confirmBtn.style.background = '#C9A84C';
        confirmBtn.style.color = '#080808';
        confirmBtn.style.border = '1px solid #C9A84C';
      }

      if (cancelBtn) {
        Object.assign(cancelBtn.style, baseStyle);
        cancelBtn.style.background = 'transparent';
        cancelBtn.style.color = '#7A7570';
        cancelBtn.style.border = '1px solid #242424';
      }

      if (confirmBtn) {
        confirmBtn.onmouseenter = () => {
          confirmBtn.style.background = '#E8C97A';
          confirmBtn.style.borderColor = '#E8C97A';
        };
        confirmBtn.onmouseleave = () => {
          confirmBtn.style.background = '#C9A84C';
          confirmBtn.style.borderColor = '#C9A84C';
        };
      }

      if (cancelBtn) {
        cancelBtn.onmouseenter = () => {
          cancelBtn.style.borderColor = 'rgba(201,168,76,0.25)';
          cancelBtn.style.color = '#F2EDE4';
        };
        cancelBtn.onmouseleave = () => {
          cancelBtn.style.borderColor = '#242424';
          cancelBtn.style.color = '#7A7570';
        };
      }
    },
  }).then((result) => {
    if (result.isConfirmed) {
      callback();
    }
  });
};


export function showHealthChecklist(callback: () => void) {
  Swal.fire({
    title: "Health Declaration",
    html: `
      <style>
        .health-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 12px 0;
          border-bottom: 1px solid #242424;
          text-align: left;
        }
        .health-item:last-child { border-bottom: none; }
        .health-item input[type="checkbox"] {
          margin-top: 2px;
          width: 14px;
          height: 14px;
          accent-color: #C9A84C;
          cursor: pointer;
          flex-shrink: 0;
        }
        .health-item label {
          color: #7A7570;
          font-size: 13px;
          line-height: 1.5;
          cursor: pointer;
          letter-spacing: 0.02em;
        }
      </style>
      <div style="margin-top: 8px;">
        <div class="health-item">
          <input type="checkbox" id="pregnant" />
          <label for="pregnant">Pregnant or breastfeeding</label>
        </div>
        <div class="health-item">
          <input type="checkbox" id="bloodThinner" />
          <label for="bloodThinner">Taking blood-thinning medication</label>
        </div>
        <div class="health-item">
          <input type="checkbox" id="skinCondition" />
          <label for="skinCondition">Serious skin condition</label>
        </div>
      </div>
    `,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Continue Booking",
    buttonsStyling: false,
    didOpen: () => {
      const popup = Swal.getPopup();
      if (popup) {
        popup.style.borderRadius = '0px';
        popup.style.border = '1px solid #242424';
        popup.style.backgroundColor = '#1A1A1A';
        popup.style.padding = '32px';
        popup.style.boxShadow = '0 0 60px rgba(201,168,76,0.08)';

        const title = popup.querySelector('.swal2-title') as HTMLElement;
        if (title) {
          title.style.color = '#F2EDE4';
          title.style.fontFamily = "'Cormorant Garamond', serif";
          title.style.fontWeight = '300';
          title.style.fontSize = '1.75rem';
          title.style.letterSpacing = '-0.02em';
        }

        const icon = popup.querySelector('.swal2-icon') as HTMLElement;
        if (icon) {
          icon.style.borderColor = '#C9A84C';
          icon.style.color = '#C9A84C';
        }

        const confirmBtn = Swal.getConfirmButton();
        const cancelBtn = Swal.getCancelButton();

        const baseStyle: Partial<CSSStyleDeclaration> = {
          padding: '8px 20px',
          borderRadius: '0px',
          cursor: 'pointer',
          fontWeight: '400',
          fontSize: '10px',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          transition: 'all 0.3s ease',
          fontFamily: 'inherit',
          marginTop: '8px',
        };

        if (confirmBtn) {
          Object.assign(confirmBtn.style, baseStyle);
          confirmBtn.style.background = '#C9A84C';
          confirmBtn.style.color = '#080808';
          confirmBtn.style.border = '1px solid #C9A84C';
        }

        if (cancelBtn) {
          Object.assign(cancelBtn.style, baseStyle);
          cancelBtn.style.background = 'transparent';
          cancelBtn.style.color = '#7A7570';
          cancelBtn.style.border = '1px solid #242424';
        }
      }
    },
    preConfirm: () => {
      const pregnant = (document.getElementById("pregnant") as HTMLInputElement)?.checked ?? false;
      const bloodThinner = (document.getElementById("bloodThinner") as HTMLInputElement)?.checked ?? false;
      const skinCondition = (document.getElementById("skinCondition") as HTMLInputElement)?.checked ?? false;

      if (pregnant || bloodThinner || skinCondition) {
        Swal.showValidationMessage(
          "Booking cannot proceed due to health restrictions. Please consult with the artist first."
        );
        return false;
      }

      return { pregnant, bloodThinner, skinCondition };
    },
  }).then((result) => {
    if (result.isConfirmed) {
      callback();
    }
  });
}

export const rejectionReason = async (callBack: (reason: string) => void) => {
  const { value: reason } = await Swal.fire({
    title: "Reject Transaction",
    html: `
      <style>
        .swal2-textarea {
          background: #121212 !important;
          border: 1px solid #242424 !important;
          border-radius: 0 !important;
          color: #F2EDE4 !important;
          font-family: inherit !important;
          font-size: 13px !important;
          padding: 12px !important;
          resize: vertical !important;
          margin-top: 0 !important;
          width: 100% !important;
          box-sizing: border-box !important;
        }
        .swal2-textarea::placeholder { color: #3D3A36 !important; }
        .swal2-textarea:focus {
          border-color: #C9A84C !important;
          outline: none !important;
          box-shadow: 0 0 0 1px rgba(201,168,76,0.3) !important;
        }
        .rejection-label {
          display: block;
          text-align: left;
          margin-bottom: 8px;
          font-size: 10px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #7A7570;
          font-family: inherit;
        }
      </style>
      <label class="rejection-label">Reason for Rejection</label>
      <textarea
        id="reason"
        class="swal2-textarea"
        placeholder="Enter reason..."
      ></textarea>
    `,
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: "Reject",
    buttonsStyling: false,
    didOpen: () => {
      const popup = Swal.getPopup();
      if (popup) {
        popup.style.borderRadius = '0px';
        popup.style.border = '1px solid #242424';
        popup.style.backgroundColor = '#1A1A1A';
        popup.style.padding = '32px';
        popup.style.boxShadow = '0 0 60px rgba(201,168,76,0.08)';

        const title = popup.querySelector('.swal2-title') as HTMLElement;
        if (title) {
          title.style.color = '#F2EDE4';
          title.style.fontFamily = "'Cormorant Garamond', serif";
          title.style.fontWeight = '300';
          title.style.fontSize = '1.75rem';
          title.style.letterSpacing = '-0.02em';
        }

        const confirmBtn = Swal.getConfirmButton();
        const cancelBtn = Swal.getCancelButton();

        const baseStyle: Partial<CSSStyleDeclaration> = {
          padding: '8px 20px',
          borderRadius: '0px',
          cursor: 'pointer',
          fontWeight: '400',
          fontSize: '10px',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          transition: 'all 0.3s ease',
          fontFamily: 'inherit',
          marginTop: '8px',
        };

        if (confirmBtn) {
          Object.assign(confirmBtn.style, baseStyle);
          confirmBtn.style.background = '#2A1010';
          confirmBtn.style.color = '#C26060';
          confirmBtn.style.border = '1px solid rgba(139,58,58,0.25)';
        }

        if (cancelBtn) {
          Object.assign(cancelBtn.style, baseStyle);
          cancelBtn.style.background = 'transparent';
          cancelBtn.style.color = '#7A7570';
          cancelBtn.style.border = '1px solid #242424';
        }

        if (confirmBtn) {
          confirmBtn.onmouseenter = () => {
            confirmBtn.style.background = 'rgba(139,58,58,0.15)';
            confirmBtn.style.borderColor = '#8B3A3A';
          };
          confirmBtn.onmouseleave = () => {
            confirmBtn.style.background = '#2A1010';
            confirmBtn.style.borderColor = 'rgba(139,58,58,0.25)';
          };
        }
      }
    },
    preConfirm: () => {
      const textarea = Swal.getPopup()?.querySelector<HTMLTextAreaElement>('textarea#reason');
      const reason = textarea?.value;
      if (!reason?.trim()) {
        Swal.showValidationMessage("Reason is required");
      }
      return reason;
    },
  });

  if (reason) {
    callBack(reason);
  }
};