# E11 — Leaderboard

- **Issue:** ZUL-153 · **Milestone:** Fase 1 — MVP · **Priority:** Medium · **Status:** Backlog
- **Branch:** `fachril21/zul-153-e11-leaderboard`

## Goal

Leaderboard global berbasis dedikasi koleksi (jumlah kartu unik + set tamat) untuk memberi rasa kompetisi & flex.

## Context

Keputusan: leaderboard = completion. RPC `get_leaderboard(limit)` sudah ada (SECURITY DEFINER, agregat lintas user — perlu karena RLS read-own).

## Scope (in)

* Halaman leaderboard: rank, username, avatar, jumlah kartu unik, set tamat.
* Highlight posisi user sendiri.
* (Opsional) filter waktu / paginasi.

## Out of scope

* Leaderboard "best pull" (fase lanjut).

## Tasks

- [ ] Halaman leaderboard (`get_leaderboard`).
- [ ] Tandai baris user saat ini.
- [ ] Empty state (belum ada data).
- [ ] (Opsional) cache ringan / materialized view bila lambat saat user banyak.

## Acceptance Criteria

- [ ] Peringkat akurat (urut by kartu unik, tiebreak set tamat).
- [ ] Username & avatar tampil; data user lain tidak bocor di luar yang ditampilkan leaderboard.
- [ ] Skala wajar (tak nge-lag di ratusan user).

## Dependencies

Blocked by **E8** (butuh koleksi/progress terisi untuk berarti).

## References

RPC `get_leaderboard`; dokumen **Architecture & Security** (catatan leaderboard tanpa Redis).
