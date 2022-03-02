const {BN} = require("../../utils");

/**
 * @param cell {Cell}
 * @return {any}
 */
function parseWalletV3TransferQuery(cell) {
    let slice = cell.beginParse();

    // header

    if (slice.loadUint(2).toNumber() !== 2) throw Error('invalid header');

    const externalSourceAddress = slice.loadAddress();
    if (externalSourceAddress !== null) throw Error('invalid externalSourceAddress');

    const externalDestAddress = slice.loadAddress();

    const externalImportFee = slice.loadCoins();
    if (!externalImportFee.eq(new BN(0))) throw new Error('invalid externalImportFee');

    // stateInit

    if (slice.loadBit()) throw Error('stateInit doesnt supported');

    // body

    if (slice.loadBit()) {
        slice = slice.loadRef();
    }
    const signature = slice.loadBits(512);

    // signing message

    const walletId = slice.loadUint(32).toNumber();
    if (walletId !== 698983191) throw new Error('invalid walletId');

    const expireAt = slice.loadUint(32).toNumber();

    const seqno = slice.loadUint(32).toNumber();

    const sendMode = slice.loadUint(8).toNumber();
    if (sendMode !== 3) throw new Error('invalid sendMode');

    let order = slice.loadRef();

    // order internal header
    if (order.loadBit()) throw Error('invalid internal header');
    if (!order.loadBit()) throw Error('invalid ihrDisabled');
    const bounce = order.loadBit();
    if (order.loadBit()) throw Error('invalid bounced');
    const sourceAddress = order.loadAddress();
    if (sourceAddress !== null) throw Error('invalid externalSourceAddress');
    const destAddress = order.loadAddress();
    const value = order.loadCoins();

    if (order.loadBit()) throw Error('invalid currencyCollection');
    const ihrFees = order.loadCoins();
    if (!ihrFees.eq(new BN(0))) throw new Error('invalid ihrFees');
    const fwdFees = order.loadCoins();
    if (!fwdFees.eq(new BN(0))) throw new Error('invalid fwdFees');
    const createdLt = order.loadUint(64);
    if (!createdLt.eq(new BN(0))) throw new Error('invalid createdLt');
    const createdAt = order.loadUint(32);
    if (!createdAt.eq(new BN(0))) throw new Error('invalid createdAt');

    // order stateInit
    if (order.loadBit()) throw Error('stateInit doesnt supported');

    // order body
    if (order.loadBit()) {
        order = order.loadRef();
    }

    const op = order.loadUint(32);
    const payloadBytes = order.loadBits(order.getFreeBits());
    const payload = op.eq(new BN(0)) ? new TextDecoder().decode(payloadBytes) : '';

    // console.log(externalSourceAddress);
    // console.log(externalDestAddress.toString(true, true, true));
    // console.log(externalImportFee);
    // console.log(bytesToHex(signature));
    // console.log(walletId);
    // console.log(expireAt);
    // console.log(seqno);
    // console.log(sendMode);
    // console.log(bounce);
    // console.log(sourceAddress?.toString(true, true, true));
    // console.log(destAddress?.toString(true, true, true));
    // console.log(value.toNumber());
    // console.log(ihrFees);
    // console.log(fwdFees);
    // console.log(createdLt);
    // console.log(createdAt);
    // console.log(payload);

    return {
        fromAddress: externalDestAddress,
        toAddress: destAddress,
        value,
        bounce,
        seqno,
        expireAt,
        payload
    };
}

module.exports = {parseWalletV3TransferQuery};
