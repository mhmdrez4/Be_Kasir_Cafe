import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({ errorFormat: "minimal" })

export const getTransaksi = async (request: Request, response: Response) => {
    try {
        const { filter } = request.query
        const allTransaksi = await prisma.transaksi.findMany({
            where: {
                OR: [
                    { tgl_transaksi: { contains: filter?.toString() || "" } },                ]
            },
            include: { detailTransaksi:{include:{menu:true}} },
        })

        return response.json({
            status: true,
            data: allTransaksi,
            message: `Transaksi List har retrieved`
        }).status(200)
    } catch (error) {
        return response
            .json({
                status: false,
                message: `There is an error. ${error}`
            })
            .status(400)
    }
}

export const createTransaksi = async (request: Request, response: Response) => {
    try {
        const { nama_pelanggan, nomor_meja, tgl_transaksi, status, detailTransaksi, user_id, transaki_id, meja_id } = request.body;

        // Variabel untuk menyimpan total harga transaksi
        let totalHarga = 0;

        // Membuat transaksi baru
        const newTransaksi = await prisma.transaksi.create({
            data: {
                id_transaksi:transaki_id,
                user_id:user_id,
                meja_id:meja_id,
                nama_pelanggan,
                status,
                tgl_transaksi
            }
        });

        // Iterasi untuk membuat detail transaksi dan menjumlahkan harga total
        for (let index = 0; index < detailTransaksi.length; index++) {
            const { menu_id, quantity, harga } = detailTransaksi[index];
            
            // Menambahkan harga item ke total harga
            totalHarga += quantity * harga;

            // Membuat detail transaksi untuk setiap item
            await prisma.detailTransaksi.create({
                data: { 
                    transaksi_id: newTransaksi.id_transaksi,
                    menu_id: Number(menu_id),
                    quantity: Number(quantity),
                    harga: Number(harga)
                }
            });
        }

        // Mengirim respons sukses dengan data transaksi baru dan total harga
        return response.status(200).json({
            status: true,
            data: { newTransaksi, total_harga: totalHarga },  // Mengirim data transaksi dengan total harga
            message: "New Transaksi has been created with total price calculated"
        });
    } catch (error) {
        // Mengirim respons error jika terjadi kesalahan
        return response.status(400).json({
            status: false,
            message: `There is an error. ${error}`
        });
    }
};


export const deleteTransaksi = async (request: Request, response: Response) => {
    try {
        const { id } = request.params

        const findTransaksi = await prisma.transaksi.findFirst({
            where: {
                id_transaksi: Number(id)
            }
        })

        if (!findTransaksi) return response.status(200).json({
            status: false,
            message: `Transaksi is not found`
        })

        let deleteDetailTransaksi = await prisma.detailTransaksi.deleteMany({
            where: {
                id_detail_transaksi: Number(id)
            }
        })

        let dropTransaksi = await prisma.transaksi.delete({
            where: {
                id_transaksi : Number(id)
            }
        })

        return response.json({
            status: true,
            data: dropTransaksi,
            message: `Transaksi has deleted`
        })
    } catch (error) {
        return response
            .json({
                status: false,
                message: `There is an error. ${error}`
            })
            .status(400)
    }
}