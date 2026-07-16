import { useEffect, useMemo, useState } from "react";
import {
  createCheckoutSession,
  fetchCampaigns,
  fetchCheckoutSession,
  fetchMerchantDashboard,
  fetchProof,
  fetchReceipt,
} from "./lib/api";
import {
  buyVoucher,
  connectWallet,
  CONTRACT_ID,
  createProject,
  DEFAULT_PAYMENT_TOKEN,
  explorerContract,
  fetchHolding,
  fetchProject,
  isContractConfigured,
  NETWORK,
  refundVoucher,
  retireVoucher,
  shortAddress,
  verifyProject,
  withdrawFunds,
} from "./lib/stellar";
import { demoCampaigns, demoHolding, demoProject, PROJECT_ID } from "./lib/demoData";
import {
  campaignToProject,
  defaultVerificationDeadline,
  flowTabs,
  getCampaignByProjectId,
  getCheckoutProjectIdFromHash,
  getCheckoutRouteFromHash,
  getFallbackProof,
  getFallbackReceipt,
  getPublicRouteFromHash,
  getRefundPolicyLabel,
  isRefundWindowOpen,
  makeCheckoutLink,
  normalizeHolding,
  normalizeProject,
  openHashRoute,
} from "./lib/viewModel";
import { ProductWorkspace } from "./components/checkout/ProductWorkspace";
import { MerchantConsole } from "./components/merchant/MerchantConsole";
import { ProofTimelinePage } from "./components/proof/ProofTimelinePage";
import { PublicReceiptPage } from "./components/proof/PublicReceiptPage";
import { MarketContext } from "./components/sections/MarketContext";
import { RoleAndFlow } from "./components/sections/RoleAndFlow";
import { SatelliteProofHero } from "./components/sections/SatelliteProofHero";
import { SolarJourney } from "./components/sections/SolarJourney";
import { PublicLoading, PublicNotFound, Topbar, TxNotice } from "./components/ui/Primitives";

export default function App() {
  const [activeFlow, setActiveFlow] = useState("customer");
  const [campaigns, setCampaigns] = useState(demoCampaigns);
  const [apiStatus, setApiStatus] = useState("loading");
  const [apiError, setApiError] = useState("");
  const [merchantDashboard, setMerchantDashboard] = useState(null);
  const [checkoutSession, setCheckoutSession] = useState(null);
  const [routeSessionId, setRouteSessionId] = useState(getCheckoutRouteFromHash().sessionId);
  const [selectedCampaignId, setSelectedCampaignId] = useState(getCheckoutProjectIdFromHash);
  const [checkoutStage, setCheckoutStage] = useState("quote");
  const [copiedLink, setCopiedLink] = useState("");
  const [address, setAddress] = useState("");
  const [project, setProject] = useState(normalizeProject(demoProject));
  const [holding, setHolding] = useState(normalizeHolding(demoHolding));
  const [quantity, setQuantity] = useState(1);
  const [voucherId, setVoucherId] = useState("");
  const [verifiedUnits, setVerifiedUnits] = useState(project.verified_units || 100);
  const [reportHash, setReportHash] = useState("ipfs://solar-meter-report-june-v2");
  const [withdrawAmount, setWithdrawAmount] = useState(1000000);
  const [createForm, setCreateForm] = useState({
    projectId: PROJECT_ID,
    title: "Da Nang Solar Classroom",
    impactUnit: "kWh of verified solar energy",
    pricePerVoucher: 1000000,
    unitPerVoucher: 10,
    paymentToken: DEFAULT_PAYMENT_TOKEN,
    metadataHash: "ipfs://solar-classroom-metadata-v2",
    verificationDeadline: defaultVerificationDeadline(),
  });
  const [lastTx, setLastTx] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");
  const [publicRoute, setPublicRoute] = useState(getPublicRouteFromHash);
  const [publicReceipt, setPublicReceipt] = useState(null);
  const [publicProof, setPublicProof] = useState(null);
  const [publicProofStatus, setPublicProofStatus] = useState("idle");
  const [publicProofError, setPublicProofError] = useState("");

  const configured = isContractConfigured();
  const selectedFlow = flowTabs.find((tab) => tab.id === activeFlow) || flowTabs[0];
  const selectedCampaign = useMemo(
    () => getCampaignByProjectId(selectedCampaignId, campaigns),
    [campaigns, selectedCampaignId],
  );
  const displayProject = useMemo(
    () => campaignToProject(selectedCampaign, project),
    [project, selectedCampaign],
  );
  const checkoutLink = useMemo(
    () => checkoutSession?.checkoutUrl || makeCheckoutLink(selectedCampaign.projectId),
    [checkoutSession?.checkoutUrl, selectedCampaign.projectId],
  );
  const totalImpact = displayProject.vouchers_sold * displayProject.unit_per_voucher;
  const verificationRatio =
    totalImpact > 0 ? Math.min(displayProject.verified_units / totalImpact, 1) : 0;
  const retiredRatio =
    displayProject.verified_units > 0
      ? Math.min(displayProject.retired_units / displayProject.verified_units, 1)
      : 0;
  const vaultBalance = Math.max(
    displayProject.funded_amount - displayProject.withdrawn_amount - displayProject.refunded_amount,
    0,
  );
  const refundRiskAmount =
    displayProject.verified_units > 0
      ? 0
      : Math.max(
          displayProject.funded_amount - displayProject.withdrawn_amount - displayProject.refunded_amount,
          0,
        );
  const refundWindowOpen = selectedCampaign.contractBacked && isRefundWindowOpen(displayProject);
  const refundPolicyLabel = getRefundPolicyLabel(displayProject, selectedCampaign);
  const canBuySelectedCampaign = configured && selectedCampaign.contractBacked;

  const preview = useMemo(() => {
    const qty = Math.max(0, Number(quantity || 0));
    return {
      cost: displayProject.price_per_voucher * qty,
      impact: displayProject.unit_per_voucher * qty,
    };
  }, [displayProject.price_per_voucher, displayProject.unit_per_voucher, quantity]);

  useEffect(() => {
    let cancelled = false;

    async function loadProductLayer() {
      try {
        const [campaignResult, dashboardResult] = await Promise.all([
          fetchCampaigns(),
          fetchMerchantDashboard(),
        ]);
        if (cancelled) return;
        setCampaigns(campaignResult.data);
        setMerchantDashboard(dashboardResult.data);
        setApiStatus("connected");
        setApiError("");
      } catch (err) {
        if (cancelled) return;
        setCampaigns(demoCampaigns);
        setMerchantDashboard(null);
        setApiStatus("fallback");
        setApiError(err.message || "Product API unavailable. Using local seed data.");
      }
    }

    loadProductLayer();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    function syncRoute() {
      const route = getCheckoutRouteFromHash();
      const nextPublicRoute = getPublicRouteFromHash();
      setPublicRoute(nextPublicRoute);
      const campaign = getCampaignByProjectId(route.projectId, campaigns);
      setSelectedCampaignId(campaign.projectId);
      setRouteSessionId(route.sessionId);
      if (nextPublicRoute.type === "checkout") {
        setActiveFlow("customer");
        setCheckoutStage("quote");
      }
    }

    syncRoute();
    window.addEventListener("hashchange", syncRoute);
    return () => window.removeEventListener("hashchange", syncRoute);
  }, [campaigns]);

  useEffect(() => {
    let cancelled = false;

    async function resolveRouteSession() {
      if (!routeSessionId || apiStatus === "fallback") return;
      try {
        const result = await fetchCheckoutSession(routeSessionId);
        if (cancelled) return;
        setCheckoutSession(result.data);
        setApiStatus("connected");
        setApiError("");
      } catch (err) {
        if (cancelled) return;
        setCheckoutSession(null);
        setApiError(err.message || "Checkout session could not be resolved.");
      }
    }

    resolveRouteSession();
    return () => {
      cancelled = true;
    };
  }, [apiStatus, routeSessionId]);

  useEffect(() => {
    let cancelled = false;

    async function prepareCheckoutSession() {
      if (apiStatus !== "connected" || routeSessionId) return;
      try {
        const result = await createCheckoutSession({
          projectId: selectedCampaign.projectId,
          quantity: Math.max(1, Number(quantity || 1)),
          buyerAddress: address || undefined,
        });
        if (cancelled) return;
        setCheckoutSession(result.data);
        setApiError("");
      } catch (err) {
        if (cancelled) return;
        setCheckoutSession(null);
        setApiStatus("fallback");
        setApiError(err.message || "Could not create checkout session. Using frontend checkout link.");
      }
    }

    prepareCheckoutSession();
    return () => {
      cancelled = true;
    };
  }, [address, apiStatus, quantity, routeSessionId, selectedCampaign.projectId]);

  useEffect(() => {
    let cancelled = false;

    async function loadPublicProof() {
      if (publicRoute.type !== "receipt" && publicRoute.type !== "proof") {
        setPublicReceipt(null);
        setPublicProof(null);
        setPublicProofStatus("idle");
        setPublicProofError("");
        return;
      }

      setPublicProofStatus("loading");
      setPublicProofError("");

      if (publicRoute.type === "receipt") {
        try {
          const receiptResult = await fetchReceipt(publicRoute.voucherId);
          const receipt = receiptResult.data;
          const proofResult = await fetchProof(receipt.projectId);
          if (cancelled) return;
          setPublicReceipt(receipt);
          setPublicProof(proofResult.data);
          setPublicProofStatus("connected");
        } catch (err) {
          const fallbackReceipt = getFallbackReceipt(publicRoute.voucherId);
          const fallbackProof = fallbackReceipt ? getFallbackProof(fallbackReceipt.projectId) : null;
          if (cancelled) return;
          setPublicReceipt(fallbackReceipt);
          setPublicProof(fallbackProof);
          setPublicProofStatus(fallbackReceipt ? "fallback" : "missing");
          setPublicProofError(err.message || "Receipt proof could not be loaded.");
        }
        return;
      }

      try {
        const proofResult = await fetchProof(publicRoute.projectId);
        if (cancelled) return;
        setPublicReceipt(proofResult.data.receipts[0] || null);
        setPublicProof(proofResult.data);
        setPublicProofStatus("connected");
      } catch (err) {
        const fallbackProof = getFallbackProof(publicRoute.projectId);
        if (cancelled) return;
        setPublicReceipt(fallbackProof?.receipts[0] || null);
        setPublicProof(fallbackProof);
        setPublicProofStatus(fallbackProof ? "fallback" : "missing");
        setPublicProofError(err.message || "Campaign proof could not be loaded.");
      }
    }

    loadPublicProof();
    return () => {
      cancelled = true;
    };
  }, [publicRoute]);

  async function refresh(currentAddress = address) {
    if (!configured || !currentAddress) return;
    const [projectResult, holdingResult] = await Promise.all([
      fetchProject(currentAddress, PROJECT_ID),
      fetchHolding(currentAddress, PROJECT_ID),
    ]);
    if (projectResult) setProject(normalizeProject(projectResult));
    if (holdingResult) setHolding(normalizeHolding(holdingResult));
  }

  async function handleConnect() {
    setBusy("wallet");
    setError("");
    try {
      const walletAddress = await connectWallet();
      setAddress(walletAddress);
      await refresh(walletAddress);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy("");
    }
  }

  async function runTx(label, action, onSuccess) {
    setBusy(label);
    setError("");
    setLastTx(null);
    try {
      if (!address) throw new Error("Connect Freighter first.");
      const result = await action();
      setLastTx(result);
      if (onSuccess) onSuccess(result);
      await refresh(address);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy("");
    }
  }

  function selectCampaign(projectId) {
    setSelectedCampaignId(projectId);
    setActiveFlow("merchant");
    setCopiedLink("");
    setCheckoutSession(null);
    setRouteSessionId("");
  }

  async function openCheckout(campaign = selectedCampaign) {
    setSelectedCampaignId(campaign.projectId);
    setActiveFlow("customer");
    setCheckoutStage("quote");
    setCopiedLink("");
    setRouteSessionId("");

    let targetLink = checkoutSession?.projectId === campaign.projectId ? checkoutSession.checkoutUrl : "";
    if (!targetLink && apiStatus === "connected") {
      try {
        const result = await createCheckoutSession({
          projectId: campaign.projectId,
          quantity: Math.max(1, Number(quantity || 1)),
          buyerAddress: address || undefined,
        });
        setCheckoutSession(result.data);
        targetLink = result.data.checkoutUrl;
        setApiError("");
      } catch (err) {
        setApiStatus("fallback");
        setApiError(err.message || "Could not create checkout session. Using frontend checkout link.");
      }
    }

    const hash = targetLink ? new URL(targetLink).hash : `#/checkout/${campaign.projectId}`;
    openHashRoute(hash);
  }

  function openProof(campaign = selectedCampaign) {
    openHashRoute(`#/proof/${campaign.projectId}`);
  }

  function openReceipt() {
    openHashRoute("#/receipt/voucher-1");
  }

  async function copyCheckoutLink() {
    try {
      await navigator.clipboard.writeText(checkoutLink);
      setCopiedLink(checkoutLink);
      setError("");
    } catch {
      setError("Copy failed. Select the checkout link and copy it manually.");
    }
  }

  async function copyPublicPageLink() {
    if (typeof window === "undefined") return;
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiedLink(window.location.href);
      setError("");
    } catch {
      setError("Copy failed. Select the page URL and copy it manually.");
    }
  }

  function updateCreateForm(patch) {
    setCreateForm((current) => ({ ...current, ...patch }));
  }

  if (publicRoute.type === "receipt") {
    if ((publicProofStatus === "idle" || publicProofStatus === "loading") && !publicReceipt) {
      return <PublicLoading title="Resolving receipt proof" />;
    }

    if (publicProofStatus === "missing" || (!publicReceipt && publicProofStatus !== "loading")) {
      return (
        <PublicNotFound
          title="Receipt was not found"
          detail={publicProofError || "This public receipt ID is not indexed by the product API."}
        />
      );
    }

    return (
      <PublicReceiptPage
        receipt={publicReceipt || getFallbackReceipt(publicRoute.voucherId)}
        proof={publicProof || getFallbackProof(1)}
        status={publicProofStatus}
        copied={copiedLink === (typeof window !== "undefined" ? window.location.href : "")}
        onCopy={copyPublicPageLink}
      />
    );
  }

  if (publicRoute.type === "proof") {
    if ((publicProofStatus === "idle" || publicProofStatus === "loading") && !publicProof) {
      return <PublicLoading title="Resolving campaign proof" />;
    }

    if (publicProofStatus === "missing" || (!publicProof && publicProofStatus !== "loading")) {
      return (
        <PublicNotFound
          title="Campaign proof was not found"
          detail={publicProofError || "This campaign proof is not indexed by the product API."}
        />
      );
    }

    return (
      <ProofTimelinePage
        proof={publicProof || getFallbackProof(publicRoute.projectId)}
        status={publicProofStatus}
        copied={copiedLink === (typeof window !== "undefined" ? window.location.href : "")}
        onCopy={copyPublicPageLink}
      />
    );
  }

  return (
    <div className="app-shell">
      <Topbar
        address={address}
        busy={busy}
        configured={configured}
        contractUrl={explorerContract(CONTRACT_ID)}
        onConnect={handleConnect}
      />

      <SatelliteProofHero
        address={address}
        busy={busy}
        configured={configured}
        contractId={CONTRACT_ID}
        displayProject={displayProject}
        network={NETWORK}
        onConnect={handleConnect}
        onOpenCheckout={() => openCheckout(selectedCampaign)}
      />

      <RoleAndFlow activeFlow={activeFlow} onSelectFlow={setActiveFlow} />

      <SolarJourney
        campaign={selectedCampaign}
        displayProject={displayProject}
        refundRiskAmount={refundRiskAmount}
        vaultBalance={vaultBalance}
      />

      <MerchantConsole
        apiError={apiError}
        apiStatus={apiStatus}
        campaigns={campaigns}
        checkoutLink={checkoutLink}
        checkoutSession={checkoutSession}
        copied={copiedLink === checkoutLink}
        merchantDashboard={merchantDashboard}
        onCopyCheckout={copyCheckoutLink}
        onOpenCheckout={openCheckout}
        onOpenProof={openProof}
        onSelectCampaign={selectCampaign}
        selectedCampaign={selectedCampaign}
      />

      <ProductWorkspace
        address={address}
        busy={busy}
        canBuySelectedCampaign={canBuySelectedCampaign}
        checkoutStage={checkoutStage}
        configured={configured}
        createForm={createForm}
        displayProject={displayProject}
        holding={holding}
        lastTx={lastTx}
        onBuy={() =>
          runTx(
            "buy",
            () => buyVoucher(address, PROJECT_ID, Number(quantity)),
            () => setCheckoutStage("receipt"),
          )
        }
        onCreate={() => runTx("create", () => createProject(address, createForm))}
        onCreateFormChange={updateCreateForm}
        onOpenReceipt={openReceipt}
        onQuantityChange={(value) => {
          setQuantity(value);
          setCheckoutStage("quote");
        }}
        onRefund={() => runTx("refund", () => refundVoucher(address, voucherId))}
        onReportHashChange={setReportHash}
        onRetire={() => runTx("retire", () => retireVoucher(address, voucherId))}
        onVerifiedUnitsChange={setVerifiedUnits}
        onVerify={() => runTx("verify", () => verifyProject(address, PROJECT_ID, Number(verifiedUnits), reportHash))}
        onVoucherIdChange={setVoucherId}
        onWithdraw={() => runTx("withdraw", () => withdrawFunds(address, PROJECT_ID, withdrawAmount))}
        onWithdrawAmountChange={setWithdrawAmount}
        preview={preview}
        quantity={quantity}
        refundPolicyLabel={refundPolicyLabel}
        refundRiskAmount={refundRiskAmount}
        refundWindowOpen={refundWindowOpen}
        reportHash={reportHash}
        retiredRatio={retiredRatio}
        selectedCampaign={selectedCampaign}
        selectedFlow={selectedFlow}
        totalImpact={totalImpact}
        vaultBalance={vaultBalance}
        verificationRatio={verificationRatio}
        verifiedUnits={verifiedUnits}
        voucherId={voucherId}
        withdrawAmount={withdrawAmount}
      />

      <MarketContext />
      <TxNotice tx={lastTx} error={error ? `${error}${address ? "" : ""}` : error} />
      {address ? (
        <p className="api-note wallet-note">Wallet connected: {shortAddress(address)}</p>
      ) : null}
    </div>
  );
}
