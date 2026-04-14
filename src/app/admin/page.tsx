"use client";

import { useState, useEffect, useCallback } from "react";
import { BRANCHES, CHANNELS, CHANNEL_COLORS } from "@/lib/constants";
import type { Promotion } from "@/lib/types";
import Link from "next/link";

const empty: Omit<Promotion, "id" | "created_at"> = {
  branch: "",
  channel: "",
  promo_name: "",
  discount_rate: 0,
  start_date: "",
  end_date: "",
  description: "",
  is_active: true,
};

export default function AdminPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [form, setForm] = useState({ ...empty });
  const [editId, setEditId] = useState<number | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState("");

  const fetchPromos = useCallback(async () => {
    const res = await fetch("/api/promotions");
    const data = await res.json();
    if (Array.isArray(data)) setPromotions(data);
  }, []);

  useEffect(() => {
    fetchPromos();
  }, [fetchPromos]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.branch || !form.channel || !form.promo_name || !form.start_date || !form.end_date) {
      alert("필수 항목을 입력해주세요");
      return;
    }

    if (editId) {
      await fetch("/api/promotions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editId, ...form }),
      });
    } else {
      await fetch("/api/promotions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    }

    setForm({ ...empty });
    setEditId(null);
    fetchPromos();
  };

  const handleEdit = (p: Promotion) => {
    setEditId(p.id!);
    setForm({
      branch: p.branch,
      channel: p.channel,
      promo_name: p.promo_name,
      discount_rate: p.discount_rate,
      start_date: p.start_date,
      end_date: p.end_date,
      description: p.description,
      is_active: p.is_active,
    });
  };

  const handleDelete = async (id: number) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    await fetch(`/api/promotions?id=${id}`, { method: "DELETE" });
    fetchPromos();
  };

  const handleToggle = async (p: Promotion) => {
    await fetch("/api/promotions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: p.id, is_active: !p.is_active }),
    });
    fetchPromos();
  };

  const handleSync = async () => {
    setSyncing(true);
    setSyncResult("");
    try {
      const res = await fetch("/api/sync", { method: "POST" });
      const data = await res.json();
      if (data.error) {
        setSyncResult(`동기화 실패: ${data.error}`);
      } else {
        setSyncResult(`동기화 완료: ${data.upserted}건`);
      }
    } catch {
      setSyncResult("동기화 오류");
    }
    setSyncing(false);
  };

  const inputClass =
    "border rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-300";

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">프로모션 관리</h1>
            <p className="text-sm text-gray-500 mt-1">OTA 프로모션 정책을 등록하고 관리합니다</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleSync}
              disabled={syncing}
              className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 disabled:opacity-50"
            >
              {syncing ? "동기화 중..." : "CTR 데이터 동기화"}
            </button>
            <Link
              href="/"
              className="bg-gray-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-700"
            >
              대시보드
            </Link>
          </div>
        </div>

        {syncResult && (
          <div
            className={`p-3 rounded-lg text-sm ${
              syncResult.includes("실패") || syncResult.includes("오류")
                ? "bg-red-50 text-red-700"
                : "bg-green-50 text-green-700"
            }`}
          >
            {syncResult}
          </div>
        )}

        {/* Promotion Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border p-6 space-y-4">
          <h2 className="text-lg font-semibold">
            {editId ? "프로모션 수정" : "새 프로모션 등록"}
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">지점 *</label>
              <select
                className={inputClass}
                value={form.branch}
                onChange={(e) => setForm({ ...form, branch: e.target.value })}
              >
                <option value="">선택</option>
                {BRANCHES.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">채널 *</label>
              <select
                className={inputClass}
                value={form.channel}
                onChange={(e) => setForm({ ...form, channel: e.target.value })}
              >
                <option value="">선택</option>
                {CHANNELS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">프로모션명 *</label>
              <input
                className={inputClass}
                value={form.promo_name}
                onChange={(e) => setForm({ ...form, promo_name: e.target.value })}
                placeholder="예: 얼리버드 10%"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">할인율 (%)</label>
              <input
                type="number"
                className={inputClass}
                value={form.discount_rate}
                onChange={(e) => setForm({ ...form, discount_rate: Number(e.target.value) })}
                min={0}
                max={100}
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">시작일 *</label>
              <input
                type="date"
                className={inputClass}
                value={form.start_date}
                onChange={(e) => setForm({ ...form, start_date: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">종료일 *</label>
              <input
                type="date"
                className={inputClass}
                value={form.end_date}
                onChange={(e) => setForm({ ...form, end_date: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">설명</label>
            <input
              className={inputClass}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="프로모션 상세 설명"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm hover:bg-blue-700"
            >
              {editId ? "수정" : "등록"}
            </button>
            {editId && (
              <button
                type="button"
                onClick={() => {
                  setForm({ ...empty });
                  setEditId(null);
                }}
                className="text-gray-500 px-4 py-2 text-sm hover:text-gray-700"
              >
                취소
              </button>
            )}
          </div>
        </form>

        {/* Promotion List */}
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-xs">
                <th className="px-4 py-3 text-left">지점</th>
                <th className="px-4 py-3 text-left">채널</th>
                <th className="px-4 py-3 text-left">프로모션</th>
                <th className="px-4 py-3 text-right">할인율</th>
                <th className="px-4 py-3 text-center">기간</th>
                <th className="px-4 py-3 text-center">상태</th>
                <th className="px-4 py-3 text-center">액션</th>
              </tr>
            </thead>
            <tbody>
              {promotions.map((p) => (
                <tr key={p.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2">{p.branch}</td>
                  <td className="px-4 py-2">
                    <span className="flex items-center gap-1.5">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: CHANNEL_COLORS[p.channel] || "#888" }}
                      />
                      {p.channel}
                    </span>
                  </td>
                  <td className="px-4 py-2 font-medium">{p.promo_name}</td>
                  <td className="px-4 py-2 text-right">{p.discount_rate}%</td>
                  <td className="px-4 py-2 text-center text-xs text-gray-500">
                    {p.start_date} ~ {p.end_date}
                  </td>
                  <td className="px-4 py-2 text-center">
                    <button
                      onClick={() => handleToggle(p)}
                      className={`text-xs px-2 py-1 rounded ${
                        p.is_active
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {p.is_active ? "진행중" : "종료"}
                    </button>
                  </td>
                  <td className="px-4 py-2 text-center">
                    <button
                      onClick={() => handleEdit(p)}
                      className="text-blue-600 text-xs mr-2 hover:underline"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => handleDelete(p.id!)}
                      className="text-red-500 text-xs hover:underline"
                    >
                      삭제
                    </button>
                  </td>
                </tr>
              ))}
              {!promotions.length && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                    등록된 프로모션이 없습니다
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
