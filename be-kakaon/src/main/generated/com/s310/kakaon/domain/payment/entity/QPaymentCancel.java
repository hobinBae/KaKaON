package com.s310.kakaon.domain.payment.entity;

import static com.querydsl.core.types.PathMetadataFactory.*;

import com.querydsl.core.types.dsl.*;

import com.querydsl.core.types.PathMetadata;
import javax.annotation.processing.Generated;
import com.querydsl.core.types.Path;
import com.querydsl.core.types.dsl.PathInits;


/**
 * QPaymentCancel is a Querydsl query type for PaymentCancel
 */
@Generated("com.querydsl.codegen.DefaultEntitySerializer")
public class QPaymentCancel extends EntityPathBase<PaymentCancel> {

    private static final long serialVersionUID = 556884806L;

    private static final PathInits INITS = PathInits.DIRECT2;

    public static final QPaymentCancel paymentCancel = new QPaymentCancel("paymentCancel");

    public final com.s310.kakaon.global.entity.QBaseEntity _super = new com.s310.kakaon.global.entity.QBaseEntity(this);

    public final NumberPath<Integer> canceledAmount = createNumber("canceledAmount", Integer.class);

    //inherited
    public final DateTimePath<java.time.LocalDateTime> createdDateTime = _super.createdDateTime;

    public final NumberPath<Long> id = createNumber("id", Long.class);

    //inherited
    public final DateTimePath<java.time.LocalDateTime> lastModifiedDateTime = _super.lastModifiedDateTime;

    public final QPayment payment;

    public final StringPath responseCode = createString("responseCode");

    public QPaymentCancel(String variable) {
        this(PaymentCancel.class, forVariable(variable), INITS);
    }

    public QPaymentCancel(Path<? extends PaymentCancel> path) {
        this(path.getType(), path.getMetadata(), PathInits.getFor(path.getMetadata(), INITS));
    }

    public QPaymentCancel(PathMetadata metadata) {
        this(metadata, PathInits.getFor(metadata, INITS));
    }

    public QPaymentCancel(PathMetadata metadata, PathInits inits) {
        this(PaymentCancel.class, metadata, inits);
    }

    public QPaymentCancel(Class<? extends PaymentCancel> type, PathMetadata metadata, PathInits inits) {
        super(type, metadata, inits);
        this.payment = inits.isInitialized("payment") ? new QPayment(forProperty("payment"), inits.get("payment")) : null;
    }

}

