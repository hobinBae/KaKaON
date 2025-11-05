package com.s310.kakaon.domain.paymentstats.entity;

import static com.querydsl.core.types.PathMetadataFactory.*;

import com.querydsl.core.types.dsl.*;

import com.querydsl.core.types.PathMetadata;
import javax.annotation.processing.Generated;
import com.querydsl.core.types.Path;
import com.querydsl.core.types.dsl.PathInits;


/**
 * QPaymentStats is a Querydsl query type for PaymentStats
 */
@Generated("com.querydsl.codegen.DefaultEntitySerializer")
public class QPaymentStats extends EntityPathBase<PaymentStats> {

    private static final long serialVersionUID = -1395349992L;

    private static final PathInits INITS = PathInits.DIRECT2;

    public static final QPaymentStats paymentStats = new QPaymentStats("paymentStats");

    public final com.s310.kakaon.global.entity.QBaseEntity _super = new com.s310.kakaon.global.entity.QBaseEntity(this);

    public final NumberPath<Long> cancelsCnt = createNumber("cancelsCnt", Long.class);

    public final NumberPath<java.math.BigDecimal> cardSales = createNumber("cardSales", java.math.BigDecimal.class);

    public final NumberPath<java.math.BigDecimal> cashSales = createNumber("cashSales", java.math.BigDecimal.class);

    //inherited
    public final DateTimePath<java.time.LocalDateTime> createdDateTime = _super.createdDateTime;

    public final NumberPath<java.math.BigDecimal> deliverySales = createNumber("deliverySales", java.math.BigDecimal.class);

    public final NumberPath<Long> id = createNumber("id", Long.class);

    public final NumberPath<java.math.BigDecimal> kakaoSales = createNumber("kakaoSales", java.math.BigDecimal.class);

    //inherited
    public final DateTimePath<java.time.LocalDateTime> lastModifiedDateTime = _super.lastModifiedDateTime;

    public final NumberPath<Long> salesCnt = createNumber("salesCnt", Long.class);

    public final com.s310.kakaon.domain.store.entity.QStore store;

    public final NumberPath<java.math.BigDecimal> totalCancels = createNumber("totalCancels", java.math.BigDecimal.class);

    public final NumberPath<java.math.BigDecimal> totalSales = createNumber("totalSales", java.math.BigDecimal.class);

    public final NumberPath<java.math.BigDecimal> transferSales = createNumber("transferSales", java.math.BigDecimal.class);

    public QPaymentStats(String variable) {
        this(PaymentStats.class, forVariable(variable), INITS);
    }

    public QPaymentStats(Path<? extends PaymentStats> path) {
        this(path.getType(), path.getMetadata(), PathInits.getFor(path.getMetadata(), INITS));
    }

    public QPaymentStats(PathMetadata metadata) {
        this(metadata, PathInits.getFor(metadata, INITS));
    }

    public QPaymentStats(PathMetadata metadata, PathInits inits) {
        this(PaymentStats.class, metadata, inits);
    }

    public QPaymentStats(Class<? extends PaymentStats> type, PathMetadata metadata, PathInits inits) {
        super(type, metadata, inits);
        this.store = inits.isInitialized("store") ? new com.s310.kakaon.domain.store.entity.QStore(forProperty("store"), inits.get("store")) : null;
    }

}

